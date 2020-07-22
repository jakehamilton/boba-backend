import React from "react";
import {
  FeedWithMenu,
  Comment,
  ThreadIndent,
  Post,
  PostSizes,
  PostHandle,
  toast,
  // @ts-ignore
} from "@bobaboard/ui-components";
import Layout from "../../../components/Layout";
import PostEditorModal from "../../../components/PostEditorModal";
import CommentEditorModal from "../../../components/CommentEditorModal";
import { useRouter } from "next/router";
import { getThreadData, markThreadAsRead } from "../../../utils/queries";
import { useQuery, useMutation, queryCache } from "react-query";
import { useAuth } from "../../../components/Auth";
import moment from "moment";
import debug from "debug";
import {
  PostType,
  CommentType,
  ThreadType,
  BoardActivityResponse,
} from "../../../types/Types";
import classnames from "classnames";
import { useBoardTheme } from "../../../components/BoardTheme";

const log = debug("bobafrontend:thread-log");

// Transform the array of posts received from the server in a tree
// representation. The return value is comprised of two values:
// the root value is the top post of the thread; the parentChildrenMap
// value is a Map from the string id of a post to its direct children.
const makePostsTree = (posts: PostType[] | undefined, threadId: string) => {
  log(`Creating posts tree for thread ${threadId}`);
  if (!posts) {
    return {
      root: undefined,
      parentChildrenMap: new Map<string, PostType[]>(),
    };
  }
  let root: PostType | null = null;
  const parentChildrenMap = new Map<string, PostType[]>();

  posts.forEach((post) => {
    if (!post.parentPostId) {
      root = post;
      return;
    }
    parentChildrenMap.set(post.parentPostId, [
      ...(parentChildrenMap.get(post.parentPostId) || ([] as PostType[])),
      post,
    ]);
  });

  return { root, parentChildrenMap };
};

const getTotalContributions = (
  post: PostType,
  postsMap: Map<string, PostType[]>
) => {
  let total = 0;
  let next = postsMap.get(post.postId);
  while (next && next.length > 0) {
    total += next.length;
    next = next.flatMap(
      (child: PostType) => (child && postsMap.get(child.postId)) || []
    );
  }
  return total;
};

const getTotalNewContributions = (
  post: PostType,
  postsMap: Map<string, PostType[]>
) => {
  let total = 0;
  let next = postsMap.get(post.postId);
  while (next && next.length > 0) {
    total += next.reduce(
      (value: number, post: PostType) => value + (post.isNew ? 1 : 0),
      0
    );
    next = next.flatMap(
      (child: PostType) => (child && postsMap.get(child.postId)) || []
    );
  }
  return total;
};

const scrollToPost = (
  postId: string,
  handler: PostHandle | undefined,
  color: string
) => {
  log(`Beaming up to post with id ${postId}`);
  const element: HTMLElement | null = document.querySelector(
    `.post[data-post-id='${postId}']`
  );
  if (!element) {
    return;
  }
  const observer = new IntersectionObserver((observed) => {
    if (observed[0].isIntersecting) {
      handler?.highlight(color);
      observer.disconnect();
    }
  });
  observer.observe(element);
  element.classList.add("outline-hidden");
  element.scrollIntoView({ behavior: "smooth" });
};

const postHandlers = new Map<string, PostHandle>();
const ThreadLevel: React.FC<{
  post: PostType;
  postsMap: Map<string, PostType[]>;
  level: number;
  onNewComment: (id: string) => void;
  onNewContribution: (id: string) => void;
  isLoggedIn: boolean;
  lastOf: { level: number; postId: string }[];
}> = (props) => {
  const router = useRouter();
  const slug = router.query.boardId?.slice(1) as string;
  const { [slug]: boardData } = useBoardTheme();
  log(
    `Rendering subtree at level ${props.level} starting with post with id ${props.post.postId}`
  );
  const isLeaf = !props.postsMap.get(props.post.postId)?.length;
  log(`Leaf post? ${isLeaf}`);
  const endsArray = isLeaf
    ? props.lastOf.map((ends) => ({
        level: ends.level,
        onClick: () => {
          scrollToPost(
            ends.postId,
            postHandlers.get(ends.postId),
            boardData.accentColor
          );
        },
      }))
    : [];
  log(`Ends array: %o`, endsArray);
  return (
    <>
      <div className="level">
        <ThreadIndent
          level={props.level}
          key={`${props.level}_${props.post.postId}`}
          ends={props.post.comments ? [] : endsArray}
        >
          <div className="post outline-hidden" data-post-id={props.post.postId}>
            <Post
              key={props.post.postId}
              ref={(handler: PostHandle) =>
                postHandlers.set(props.post.postId, handler)
              }
              size={
                props.post.options?.wide ? PostSizes.WIDE : PostSizes.REGULAR
              }
              createdTime={moment.utc(props.post.created).fromNow()}
              text={props.post.content}
              secretIdentity={props.post.secretIdentity}
              userIdentity={props.post.userIdentity}
              onNewContribution={() =>
                props.onNewContribution(props.post.postId)
              }
              onNewComment={() => props.onNewComment(props.post.postId)}
              totalComments={props.post.comments?.length}
              directContributions={
                props.postsMap.get(props.post.postId)?.length
              }
              totalContributions={getTotalContributions(
                props.post,
                props.postsMap
              )}
              newPost={props.isLoggedIn && props.post.isNew}
              newComments={props.isLoggedIn ? props.post.newCommentsAmount : 0}
              newContributions={
                props.isLoggedIn
                  ? getTotalNewContributions(props.post, props.postsMap)
                  : 0
              }
              centered={props.postsMap.size == 0}
              answerable={props.isLoggedIn}
              onNotesClick={() => {}}
              notesUrl={"#"}
              tags={props.post.tags}
              muted={props.isLoggedIn && !props.post.isNew && props.level > 0}
            />
          </div>
        </ThreadIndent>
        {props.post.comments && (
          <ThreadIndent
            level={props.level + 1}
            ends={
              isLeaf
                ? [
                    ...endsArray,
                    {
                      level: props.level,
                      onClick: () =>
                        scrollToPost(
                          props.post.postId,
                          postHandlers.get(props.post.postId),
                          boardData.accentColor
                        ),
                    },
                  ]
                : []
            }
          >
            {props.post.comments.map((comment: CommentType, i: number) => (
              <Comment
                key={comment.commentId}
                id={comment.commentId}
                secretIdentity={comment.secretIdentity}
                userIdentity={comment.userIdentity}
                initialText={comment.content}
                muted={props.isLoggedIn && !comment.isNew}
              />
            ))}
          </ThreadIndent>
        )}
        {props.postsMap
          .get(props.post.postId)
          ?.flatMap((post: PostType, index: number, array) => (
            <ThreadLevel
              key={post.postId}
              post={post}
              postsMap={props.postsMap}
              level={props.level + 1}
              onNewComment={props.onNewComment}
              onNewContribution={props.onNewContribution}
              isLoggedIn={props.isLoggedIn}
              lastOf={
                index == array.length - 1
                  ? [
                      ...props.lastOf,
                      { level: props.level, postId: props.post.postId },
                    ]
                  : props.lastOf
              }
            />
          ))}
        <style jsx>
          {`
            .level {
              width: 100%;
            }
            .post {
              margin-top: 15px;
              scroll-margin: 10px;
              position: relative;
            }
          `}
        </style>
      </div>
    </>
  );
};
const MemoizedThreadLevel = React.memo(ThreadLevel);

const getThreadInBoardCache = ({
  slug,
  threadId,
}: {
  slug: string;
  threadId: string;
}) => {
  const boardData:
    | BoardActivityResponse[]
    | undefined = queryCache.getQueryData(["boardActivityData", { slug }]);
  if (!boardData) {
    log(`Found no initial board activity data`);
    return undefined;
  }
  log(`Found initial board activity data for board ${slug}`);
  log(boardData);
  const thread = boardData
    .flatMap((data) => data.activity)
    .find((thread) => thread.threadId == threadId);
  if (!thread) {
    return undefined;
  }

  log(`Found thread:`);
  log(thread);
  return { thread, boardData };
};

function ThreadPage() {
  const [postReplyId, setPostReplyId] = React.useState<string | null>(null);
  const [commentReplyId, setCommentReplyId] = React.useState<string | null>(
    null
  );
  const router = useRouter();
  const threadId = router.query.id as string;
  const { user, isLoggedIn } = useAuth();
  const slug: string = router.query.boardId?.slice(1) as string;
  const { data: threadData, isFetching: isFetchingThread } = useQuery(
    ["threadData", { threadId }],
    getThreadData,
    {
      refetchOnWindowFocus: false,
      initialData: () => {
        log(
          `Searching board activity data for board ${slug} and thread ${threadId}`
        );
        return getThreadInBoardCache({ slug, threadId })?.thread;
      },
      onSuccess: () => {
        log(`Retrieved thread data for thread with id ${threadId}`);
        if (isLoggedIn) {
          readThread();
        }
      },
      initialStale: true,
    }
  );

  const [readThread] = useMutation(() => markThreadAsRead({ threadId }), {
    onSuccess: () => {
      log(`Successfully marked thread as read`);
      const threadResult = getThreadInBoardCache({ slug, threadId });
      if (threadResult) {
        log(`Found thread in cache:`);
        log(threadResult.thread);
        threadResult.thread.isNew = false;
        threadResult.thread.newCommentsAmount = 0;
        threadResult.thread.newPostsAmount = 0;

        threadResult.thread.posts.forEach((post) => {
          post.isNew = false;
          post.newCommentsAmount = 0;
          post.newPostsAmount = 0;
          post.comments?.forEach((comment) => {
            comment.isNew = false;
          });
        });

        queryCache.setQueryData(
          ["boardActivityData", { slug }],
          threadResult.boardData
        );
      }
    },
  });
  const { root, parentChildrenMap } = React.useMemo(
    () => makePostsTree(threadData?.posts, threadId),
    [threadData, threadId]
  );

  if (!root) {
    return <div />;
  }

  return (
    <div className="main">
      {isLoggedIn && (
        <>
          <PostEditorModal
            isOpen={!!postReplyId}
            secretIdentity={{
              name: "[TBD]",
              avatar: `/tuxedo-mask.jpg`,
            }}
            userIdentity={{
              name: user?.username,
              avatar: user?.avatarUrl,
            }}
            onPostSaved={(post: PostType) => {
              log(
                `Saved new prompt to thread ${threadId}, replying to post ${postReplyId}.`
              );
              log(post);
              const threadData = queryCache.getQueryData<ThreadType>([
                "threadData",
                { threadId },
              ]);
              if (!threadData) {
                log(
                  `Couldn't read thread data during post upload for thread id ${threadId}`
                );
                return;
              }
              threadData.posts = [...threadData.posts, post];
              queryCache.setQueryData(["threadData", { threadId }], () => ({
                ...threadData,
              }));
              setPostReplyId(null);
            }}
            onCloseModal={() => setPostReplyId(null)}
            slug={slug}
            replyToPostId={postReplyId}
            uploadBaseUrl={`images/${slug}/${router.query.id}/`}
          />
          <CommentEditorModal
            isOpen={!!commentReplyId}
            secretIdentity={{
              name: "[TBD]",
              avatar: `/tuxedo-mask.jpg`,
            }}
            userIdentity={{
              name: user?.username,
              avatar: user?.avatarUrl,
            }}
            onCommentSaved={(comment: any) => {
              log(
                `Saved new comment to thread ${threadId}, replying to post ${commentReplyId}.`
              );
              log(comment);
              const threadData = queryCache.getQueryData<ThreadType>([
                "threadData",
                { threadId },
              ]);
              if (!threadData) {
                log(
                  `Couldn't read thread data during comment upload for thread id ${threadId}`
                );
                return;
              }
              const parentIndex = threadData.posts.findIndex(
                (post) => post.postId == commentReplyId
              );
              log(`Found parent post with index ${parentIndex}`);
              if (parentIndex == -1) {
                toast.error("wtf");
                return;
              }
              threadData.posts[parentIndex] = {
                ...threadData.posts[parentIndex],
                newCommentsAmount:
                  threadData.posts[parentIndex].newCommentsAmount + 1,
                comments: [
                  ...(threadData.posts[parentIndex].comments || []),
                  comment,
                ],
              };
              queryCache.setQueryData(["threadData", { threadId }], () => ({
                ...threadData,
              }));
              setCommentReplyId(null);
            }}
            onCloseModal={() => setCommentReplyId(null)}
            replyTo={commentReplyId}
          />
        </>
      )}
      <Layout
        mainContent={
          <FeedWithMenu
            sidebarContent={<div />}
            feedContent={
              <div className="feed-content">
                <MemoizedThreadLevel
                  post={root}
                  postsMap={parentChildrenMap}
                  level={0}
                  onNewComment={setCommentReplyId}
                  onNewContribution={setPostReplyId}
                  isLoggedIn={isLoggedIn}
                  lastOf={[]}
                />
                <div
                  className={classnames("loading-indicator", {
                    loading: isFetchingThread,
                  })}
                >
                  Loading...
                </div>
              </div>
            }
          />
        }
        title={`!${slug}`}
        onTitleClick={() => {
          router.push(`/[boardId]`, `/!${slug}`, {
            shallow: true,
          });
        }}
        loading={isFetchingThread}
      />
      <style jsx>
        {`
          .feed-content {
            max-width: 100%;
            padding-bottom: 20px;
          }
          .loading-indicator {
            color: white;
            width: 100%;
            text-align: center;
            padding: 20px;
            display: none;
          }
          .loading-indicator.loading {
            display: block;
          }
        `}
      </style>
    </div>
  );
}

export default ThreadPage;
