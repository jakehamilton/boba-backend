import debug from "debug";
import express from "express";
import {
  getThreadByStringId,
  getThreadIdentitiesByStringId,
  createThread,
} from "./queries";
import { isLoggedIn } from "../auth-handler";

const info = debug("bobaserver:threads:routes-info");
const log = debug("bobaserver:threads:routes-log");

const router = express.Router();

const mergeThreadAndIdentities = (thread: any, identities: any[]) => {
  log(identities);
  const identitiesMap = identities.reduce((accumulator, identity) => {
    log(identity);
    accumulator[identity.id] = identity;
    return accumulator;
  }, {});
  thread.posts.map((post: any) => {
    const authorIdentity = identitiesMap[post.author];
    delete post.author;
    post.secret_identity = {
      name: authorIdentity.display_name,
      avatar: authorIdentity.secret_identity_avatar_reference_id,
    };
    if (authorIdentity.friend) {
      post.userIdentity = {
        name: authorIdentity.username,
        avatar: authorIdentity.user_avatar_reference_id,
      };
    }

    post.comments?.map((comment: any) => {
      const authorIdentity = identitiesMap[comment.author];
      delete comment.author;
      comment.secret_identity = {
        name: authorIdentity.display_name,
        avatar: authorIdentity.secret_identity_avatar_reference_id,
      };
      if (authorIdentity.friend) {
        comment.userIdentity = {
          name: authorIdentity.username,
          avatar: authorIdentity.user_avatar_reference_id,
        };
      }
    });
  });
  return thread;
};

router.get("/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  log(`Fetching data for thread with id ${id}`);

  const [thread, identities] = await Promise.all([
    getThreadByStringId({
      id,
      // @ts-ignore
      user: req.currentUser?.uid,
    }),
    getThreadIdentitiesByStringId({
      id,
      // @ts-ignore
      user: req.currentUser?.uid,
    }),
  ]);
  info(`Found thread %O`, thread);

  if (!thread) {
    res.sendStatus(404);
    return;
  }
  // TODO: add identity management logic to thread
  res.status(200).json(mergeThreadAndIdentities(thread, identities));
});

router.get("/activity/latest", async (req, res) => {
  // TODO: implement. Gets latest active threads.
  res.status(501);
});

router.post("/:boardSlug/create", isLoggedIn, async (req, res) => {
  // @ts-ignore
  if (!req.currentUser) {
    return res.sendStatus(301);
  }
  const { boardSlug } = req.params;
  log(`Creating thread in board with slug ${boardSlug}`);
  const { content, forceAnonymous } = req.body;

  const threadStringId = await createThread({
    // @ts-ignore
    userId: req.currentUser.uid,
    content,
    anonymityType: "everyone",
    boardSlug: boardSlug,
  });
  info(`Created new thread %O`, threadStringId);

  if (!threadStringId) {
    res.sendStatus(500);
    return;
  }
  res.status(200).json(
    await getThreadByStringId({
      id: threadStringId,
      // @ts-ignore
      user: req.currentUser.uid,
    })
  );
});

export default router;
