import React from "react";
import { ThreadIndent } from "@bobaboard/ui-components";
import debug from "debug";
import {
  ThreadContextType,
  withThreadData,
} from "components/thread/ThreadQueryHook";
import classnames from "classnames";
import TemporarySegmentedButton from "./TemporarySegmentedButton";
import CommentsThread from "./CommentsThread";
import { PostType } from "types/Types";
import ThreadPost from "./ThreadPost";
import { ExistanceParam } from "components/QueryParamNextProvider";
import { useQueryParams } from "use-query-params";
//import { useHotkeys } from "react-hotkeys-hook";

// @ts-ignore
const log = debug("bobafrontend:threadLevel-log");

enum TIMELINE_VIEW_MODE {
  NEW,
  LATEST,
  ALL,
}
const TimelineViewQueryParams = {
  new: ExistanceParam,
  latest: ExistanceParam,
  all: ExistanceParam,
};

const getCurrentViewMode = () => {
  const [query] = useQueryParams(TimelineViewQueryParams);
  if (query.new) {
    return TIMELINE_VIEW_MODE.NEW;
  } else if (query.latest) {
    return TIMELINE_VIEW_MODE.LATEST;
  } else if (query.all) {
    return TIMELINE_VIEW_MODE.ALL;
  }
  return TIMELINE_VIEW_MODE.NEW;
};

interface TimelineViewProps extends ThreadContextType {
  onNewComment: (
    replyToPostId: string,
    replyToCommentId: string | null
  ) => void;
  onNewContribution: (id: string) => void;
  onEditPost: (post: PostType) => void;
  isLoggedIn: boolean;
  displayAtMost: number;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  chronologicalPostsSequence,
  postCommentsMap,
  isLoading,
  ...props
}) => {
  const currentViewMode = getCurrentViewMode();
  const [timelineView, setTimelineView] = React.useState(currentViewMode);
  const [timelineViewQuery, setQuery] = useQueryParams(TimelineViewQueryParams);

  React.useEffect(() => {
    setTimelineView(currentViewMode);
  }, [timelineViewQuery]);

  React.useEffect(() => {
    // Remove all associated url artifacts when exiting view mode.
    return () =>
      setQuery(
        (params) => ({
          ...params,
          all: false,
          new: false,
          latest: false,
        }),
        "replaceIn"
      );
  }, []);

  React.useEffect(() => {
    const hasNew = chronologicalPostsSequence.some(
      (post) => post.newCommentsAmount > 0 || post.isNew
    );
    if (!isLoading && !hasNew && timelineView == TIMELINE_VIEW_MODE.NEW) {
      setQuery(
        {
          all: false,
          new: false,
          latest: true,
        },
        "replaceIn"
      );
    }
  }, [isLoading]);

  const { updatedPosts, allPosts } = React.useMemo(() => {
    // @ts-ignore
    let [unusedFirstElement, ...allPosts] = chronologicalPostsSequence;
    const updatedPosts = chronologicalPostsSequence.filter(
      (post) => post.isNew || post.newCommentsAmount > 0
    );

    return {
      allPosts: chronologicalPostsSequence,
      updatedPosts,
    };
  }, [chronologicalPostsSequence, postCommentsMap]);

  const displayPosts =
    timelineView === TIMELINE_VIEW_MODE.ALL
      ? allPosts
      : timelineView == TIMELINE_VIEW_MODE.LATEST
      ? [...allPosts].reverse()
      : updatedPosts;

  return (
    <div
      className={classnames("timeline-container", {
        "logged-in": props.isLoggedIn,
      })}
    >
      <div className="timeline-views">
        <TemporarySegmentedButton
          options={[
            {
              id: TIMELINE_VIEW_MODE.NEW,
              label: "New",
              updates:
                updatedPosts.length > 0 ? updatedPosts.length : undefined,
              onClick: () =>
                setQuery({
                  all: false,
                  new: true,
                  latest: false,
                }),
            },
            {
              id: TIMELINE_VIEW_MODE.LATEST,
              label: "Latest",
              onClick: () =>
                setQuery({
                  all: false,
                  new: false,
                  latest: true,
                }),
            },
            {
              id: TIMELINE_VIEW_MODE.ALL,
              label: `All (${allPosts.length})`,
              onClick: () =>
                setQuery({
                  all: true,
                  new: false,
                  latest: false,
                }),
            },
          ]}
          selected={timelineView}
        />
      </div>
      <div>
        {displayPosts.length == 0 && (
          <div className="empty">No post available.</div>
        )}
        {displayPosts
          .filter((_, index) => index < props.displayAtMost)
          .map((post) => (
            <div className="thread" key={post.postId}>
              <div className="post" key={post.postId}>
                <ThreadPost
                  post={post}
                  isLoggedIn={props.isLoggedIn}
                  onNewContribution={props.onNewContribution}
                  onNewComment={props.onNewComment}
                  onEditPost={props.onEditPost}
                />
              </div>
              {post.comments && (
                <ThreadIndent level={1} key={`0_${post.postId}`} ends={[]}>
                  <CommentsThread
                    isLoggedIn={props.isLoggedIn}
                    parentPostId={post.postId}
                    parentCommentId={null}
                    level={0}
                    onReplyTo={(replyToCommentId: string) =>
                      props.onNewComment(post.postId, replyToCommentId)
                    }
                  />
                </ThreadIndent>
              )}
            </div>
          ))}
      </div>
      <style jsx>{`
        .timeline-container {
          width: 100%;
          text-align: center;
          max-width: 550px;
          margin: 0 auto;
        }
        .post {
          position: relative;
          z-index: 1;
        }
        .thread {
          margin-bottom: 20px;
        }
        .empty {
          color: white;
          width: 100%;
        }
        .timeline-views {
          margin: 20px 30px;
        }
        .button {
          display: none;
        }
        .logged-in .button {
          display: block;
        }
      `}</style>
    </div>
  );
};

export default withThreadData(TimelineView);
