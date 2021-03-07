import React from "react";
import {
  MasonryView,
  NewThread,
  SegmentedButton,
} from "@bobaboard/ui-components";
import {
  ThreadContextType,
  withThreadData,
} from "components/thread/ThreadQueryHook";
import CommentsThread from "./CommentsThread";
import { PostType } from "types/Types";
import ThreadPost, { scrollToPost } from "./ThreadPost";
import { useAuth } from "components/Auth";
import {
  EditorActions,
  useEditorsDispatch,
} from "components/editors/EditorsContext";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import { useStemOptions } from "components/hooks/useStemOptions";
import { useBoardContext } from "components/BoardContext";

import debug from "debug";
import { extractPostId, getCommentThreadId } from "./ThreadView";
import {
  GalleryViewMode,
  GALLERY_VIEW_MODE,
  useThreadView,
} from "./useThreadView";
const log = debug("bobafrontend:threadPage:GalleryView-log");

const EmptyGalleryView = (
  props:
    | {
        emptyMessage: string;
      }
    | {
        cover: PostType;
        showCover: boolean;
        setShowCover: (show: boolean) => void;
        emptyMessage: string;
      }
) => (
  <div>
    {"cover" in props && (
      <ShowCover
        cover={props.cover}
        setShowCover={props.setShowCover}
        showCover={props.showCover}
      />
    )}
    <div className="image">
      <img src="/empty_gallery.gif" />
    </div>
    <div className="empty">{props.emptyMessage}</div>
    <style jsx>{`
      .image {
        text-align: center;
      }
      .image img {
        max-width: 100%;
      }
      .empty {
        color: white;
        text-align: center;
        margin-top: 10px;
        font-size: normal;
      }
      a {
        display: block;
        color: white;
        text-align: center;
        font-size: small;
        margin-top: 10px;
        margin-bottom: 10px;
      }
    `}</style>
  </div>
);

// This is just a temporary component until we get a better handler here.
const ShowCover = ({
  cover,
  showCover,
  setShowCover,
}: {
  cover: PostType;
  showCover: boolean;
  setShowCover: (show: boolean) => void;
}) => (
  <>
    <a
      href="#"
      onClick={(e) => {
        setShowCover(!showCover);
        e.preventDefault();
      }}
    >
      {showCover ? "Hide" : "Show"} cover (
      {cover?.commentsAmount || 0 /*TODO: wtf?? why do we need this??*/}{" "}
      comments, {cover?.newCommentsAmount} new)
    </a>
    <style jsx>{`
      a {
        display: block;
        color: white;
        text-align: center;
        font-size: small;
        margin-top: 10px;
        margin-bottom: 10px;
      }
    `}</style>
  </>
);

const getPostsToDisplay = (
  posts: {
    coverPost: PostType;
    updatedPosts: PostType[];
    allGalleryPosts: PostType[];
  },
  galleryView: GalleryViewMode
) => {
  const { coverPost, updatedPosts, allGalleryPosts } = posts;
  const toDisplay = [
    ...(galleryView.mode === GALLERY_VIEW_MODE.NEW
      ? updatedPosts
      : allGalleryPosts),
  ];

  if (coverPost && galleryView.showCover) {
    toDisplay.unshift(coverPost);
  }
  return toDisplay;
};

interface GalleryThreadViewProps extends ThreadContextType {
  displayAtMost: number;
  onTotalPostsChange: (total: number) => void;
}
const GalleryThreadView: React.FC<GalleryThreadViewProps> = ({
  onTotalPostsChange,
  chronologicalPostsSequence,
  ...props
}) => {
  const masonryRef = React.createRef<{ reposition: () => void }>();
  const [showComments, setShowComments] = React.useState<string[]>([]);
  const { isLoggedIn } = useAuth();
  const dispatch = useEditorsDispatch();
  const { slug: boardSlug, threadId } = usePageDetails<ThreadPageDetails>();
  const boardData = useBoardContext(boardSlug);
  const { galleryViewMode, setGalleryViewMode } = useThreadView();

  const repositionGallery = React.useCallback(() => {
    masonryRef.current?.reposition();
  }, [masonryRef]);

  // const activeCategories = categoryFilterState.filter(
  //   (category) => category.active
  // );
  // const isUntaggedActive = activeCategories.some(
  //   (category) => category.name == UNCATEGORIZED_LABEL
  // );
  // let orderedPosts = unfilteredArray;
  // if (activeCategories.length != categoryFilterState.length) {
  //   orderedPosts = unfilteredArray.filter(
  //     (post) =>
  //       (post.tags.categoryTags.length == 0 && isUntaggedActive) ||
  //       post.tags.categoryTags.some((category) =>
  //         activeCategories.some(
  //           (activeCategory) => category == activeCategory.name
  //         )
  //       )
  //   );
  // }

  React.useEffect(() => {
    requestAnimationFrame(() => masonryRef.current?.reposition());
  }, [showComments, galleryViewMode.showCover, masonryRef]);
  const onNotesClick = React.useCallback((postId) => {
    setShowComments((showComments) =>
      showComments.includes(postId)
        ? showComments.filter((id) => postId != id)
        : [...showComments, postId]
    );
  }, []);

  const postTypes = React.useMemo(() => {
    const [coverPost, ...allGalleryPosts] = chronologicalPostsSequence;
    const updatedPosts = allGalleryPosts.filter(
      (post) => post.isNew || post.newCommentsAmount > 0
    );
    // We always automatically show all the posts when something posted there
    // is new.
    setShowComments(
      chronologicalPostsSequence
        .filter((post) => post.newCommentsAmount > 0)
        .map((post) => post.postId)
    );

    return {
      coverPost,
      allGalleryPosts,
      updatedPosts,
    };
  }, [chronologicalPostsSequence]);

  const toDisplay = React.useMemo(
    () => getPostsToDisplay(postTypes, galleryViewMode),
    [postTypes, galleryViewMode]
  );

  React.useEffect(() => {
    onTotalPostsChange(toDisplay.length);
  }, [toDisplay.length, onTotalPostsChange]);

  const onCollapseLevel = React.useCallback(
    (levelId) => {
      onNotesClick(extractPostId(levelId));
    },
    [onNotesClick]
  );
  const onUncollapseLevel = React.useCallback(
    (levelId) => {
      onNotesClick(extractPostId(levelId));
    },
    [onNotesClick]
  );
  const getCollapseReason = React.useCallback(() => {
    return <div>Subthread manually hidden.</div>;
  }, []);

  const getStemOptions = useStemOptions({
    boardSlug,
    threadId,
    onCollapse: (levelId) => {
      onCollapseLevel(levelId);
    },
    onScrollTo: (levelId) => {
      if (!levelId) {
        return;
      }
      scrollToPost(extractPostId(levelId), boardData?.accentColor);
    },
    onReply: (levelId) => {
      if (!levelId) {
        return;
      }
      onNewContribution(extractPostId(levelId));
    },
  });

  const { coverPost, updatedPosts, allGalleryPosts } = postTypes;

  const onNewComment = React.useCallback(
    (replyToContributionId: string, replyToCommentId: string | null) => {
      dispatch({
        type: EditorActions.NEW_COMMENT,
        payload: {
          boardSlug,
          threadId,
          replyToContributionId,
          replyToCommentId,
        },
      });
    },
    [boardSlug, threadId, dispatch]
  );

  const onNewContribution = React.useCallback(
    (replyToContributionId: string) => {
      dispatch({
        type: EditorActions.NEW_CONTRIBUTION,
        payload: {
          boardSlug,
          threadId,
          replyToContributionId,
        },
      });
    },
    [boardSlug, threadId, dispatch]
  );

  const onEditContribution = React.useCallback(
    (editContribution: PostType) => {
      dispatch({
        type: EditorActions.EDIT_TAGS,
        payload: {
          boardSlug,
          threadId,
          contributionId: editContribution.postId,
        },
      });
    },
    [boardSlug, threadId, dispatch]
  );

  if (!galleryViewMode.showCover && !allGalleryPosts.length) {
    return (
      <EmptyGalleryView
        showCover={galleryViewMode.showCover}
        setShowCover={(show: boolean) => {
          setGalleryViewMode({
            mode: galleryViewMode.mode,
            showCover: show,
          });
        }}
        cover={coverPost}
        emptyMessage={"The gallery is empty :("}
      />
    );
  }

  log(toDisplay);
  return (
    <div className="gallery">
      <div className="view-controls">
        <ShowCover
          cover={coverPost}
          showCover={galleryViewMode.showCover}
          setShowCover={(show: boolean) => {
            setGalleryViewMode({
              mode: galleryViewMode.mode,
              showCover: show,
            });
          }}
        />
        <SegmentedButton
          options={[
            {
              id: GALLERY_VIEW_MODE.NEW,
              label: "New & Updated",
              updates:
                updatedPosts.length > 0 ? updatedPosts.length : undefined,
              onClick: () =>
                setGalleryViewMode({
                  mode: GALLERY_VIEW_MODE.NEW,
                  showCover: galleryViewMode.showCover,
                }),
            },
            {
              id: GALLERY_VIEW_MODE.ALL,
              label: `All Posts (${
                allGalleryPosts.length + (galleryViewMode.showCover ? 1 : 0)
              })`,
              onClick: () =>
                setGalleryViewMode({
                  mode: GALLERY_VIEW_MODE.ALL,
                  showCover: galleryViewMode.showCover,
                }),
            },
          ]}
          selected={galleryViewMode.mode}
        />
      </div>
      {toDisplay.length == 0 && (
        <EmptyGalleryView emptyMessage={"No new (or updated) posts!"} />
      )}
      {toDisplay.length > 0 && (
        <MasonryView ref={masonryRef}>
          {toDisplay
            .filter((_, index) => index < props.displayAtMost)
            .map((post) => (
              <div
                className="thread"
                key={post.postId}
                // TODO: figure out why this is necessary.
                // Right now it's here because there is a bug in the masonry view where
                // when the elements are changed the positions are recalculated but, for some reason,
                // position: absolute isn't maintained in certain divs. I assume it has somethign to do
                // with react and re-rendering, but honestly I have no idea.
                style={{ position: "absolute" }}
              >
                <NewThread
                  onCollapseLevel={onCollapseLevel}
                  onUncollapseLevel={onUncollapseLevel}
                  getCollapseReason={getCollapseReason}
                  getStemOptions={getStemOptions}
                >
                  {(setThreadBoundary) => (
                    <>
                      <div className="post">
                        <ThreadPost
                          post={post}
                          isLoggedIn={isLoggedIn}
                          onNewContribution={onNewContribution}
                          onNewComment={onNewComment}
                          onEditPost={onEditContribution}
                          onNotesClick={onNotesClick}
                          onEmbedLoaded={repositionGallery}
                          avatarRef={setThreadBoundary}
                        />
                      </div>
                      {post.comments && showComments.includes(post.postId) && (
                        <NewThread.Indent id={getCommentThreadId(post.postId)}>
                          <CommentsThread parentPostId={post.postId} />
                        </NewThread.Indent>
                      )}
                    </>
                  )}
                </NewThread>
              </div>
            ))}
        </MasonryView>
      )}
      <style jsx>{`
        .gallery {
          width: 100%;
          position: relative;
          margin-top: 20px;
          margin-bottom: 20px;
        }
        .view-controls {
          margin: 0 auto;
          margin-bottom: 15px;
          max-width: 300px;
        }
        .post {
          z-index: 1;
          position: relative;
        }
        .thread {
          max-width: min(45%, 550px);
        }
        @media only screen and (max-width: 550px) {
          .thread {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default withThreadData(GalleryThreadView);
