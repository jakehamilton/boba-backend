import { BadRequest400Error, Forbidden403Error } from "types/errors/api";
import { DbCommentType, DbPostType, QueryTagsType } from "Types";

import { ITask } from "pg-promise";
import { canPostAs } from "utils/permissions-utils";
import debug from "debug";
import invariant from "tiny-invariant";
import pool from "server/db-pool";
import sql from "./sql";
import threadsSql from "../threads/sql";
import { v4 as uuidv4 } from "uuid";

const log = debug("bobaserver:posts:queries-log");
const error = debug("bobaserver:posts:queries-error");

export const maybeAddIndexTags = async (
  transaction: ITask<any>,
  {
    indexTags,
    postId,
  }: {
    indexTags: string[];
    postId: number;
  }
): Promise<string[]> => {
  if (!indexTags?.length) {
    return [];
  }
  const tags = indexTags
    .filter((tag) => !!tag.trim().length)
    .map((tag) => tag.trim().toLowerCase());
  await transaction.manyOrNone(sql.createAddTagsQuery(tags));
  log(`Returning tags:`);
  await transaction.many(sql.createAddTagsToPostQuery(postId, tags));

  return tags;
};

export const removeIndexTags = async (
  transaction: ITask<any>,
  {
    indexTags,
    postId,
  }: {
    indexTags: string[];
    postId: number;
  }
): Promise<null> => {
  if (!indexTags?.length) {
    return null;
  }
  const tags = indexTags
    .filter((tag) => !!tag.trim().length)
    .map((tag) => tag.trim().toLowerCase());

  return await transaction.none(sql.deleteTagsFromPost, {
    post_id: postId,
    tags,
  });
};

export const maybeAddCategoryTags = async (
  transaction: ITask<any>,
  {
    categoryTags,
    postId,
  }: {
    categoryTags: string[];
    postId: number;
  }
): Promise<string[]> => {
  if (!categoryTags?.length) {
    return [];
  }
  const tags = categoryTags
    .filter((tag) => !!tag.trim().length)
    .map((tag) => tag.trim().toLowerCase());

  await transaction.manyOrNone(sql.createAddCategoriesQuery(tags));
  log(`Returning tags: ${tags}`);
  await transaction.many(sql.createAddCategoriesToPostQuery(postId, tags));

  return tags;
};

export const removeCategoryTags = async (
  transaction: ITask<any>,
  {
    categoryTags,
    postId,
  }: {
    categoryTags: string[];
    postId: number;
  }
): Promise<null> => {
  if (!categoryTags?.length) {
    return null;
  }
  const tags = categoryTags
    .filter((tag) => !!tag.trim().length)
    .map((tag) => tag.trim().toLowerCase());

  return await transaction.none(sql.deleteCategoriesFromPost, {
    post_id: postId,
    categories: tags,
  });
};

export const maybeAddContentWarningTags = async (
  transaction: ITask<any>,
  {
    contentWarnings,
    postId,
  }: {
    contentWarnings: string[];
    postId: number;
  }
): Promise<string[]> => {
  if (!contentWarnings?.length) {
    return [];
  }
  const tags = contentWarnings
    .filter((tag) => !!tag.trim().length)
    .map((tag) => tag.trim().toLowerCase());
  await transaction.manyOrNone(sql.createAddContentWarningsQuery(tags));
  log(`Returning tags:`);
  await transaction.many(sql.createAddContentWarningsToPostQuery(postId, tags));

  return tags;
};

export const removeContentWarningTags = async (
  transaction: ITask<any>,
  {
    contentWarnings,
    postId,
  }: {
    contentWarnings: string[];
    postId: number;
  }
): Promise<null> => {
  if (!contentWarnings?.length) {
    return null;
  }
  const tags = contentWarnings
    .filter((tag) => !!tag.trim().length)
    .map((tag) => tag.trim().toLowerCase());

  return await transaction.none(sql.deleteContentWarningsFromPost, {
    post_id: postId,
    warnings: tags,
  });
};

export const updateWhisperTags = async (
  transaction: ITask<any>,
  {
    postId,
    whisperTags,
  }: {
    postId: number;
    whisperTags: string[];
  }
): Promise<null> => {
  return await transaction.none(sql.updatePostWhisperTags, {
    whisper_tags: whisperTags,
    post_id: postId,
  });
};

// TODO: rename this method since there's a mutation within it.
const getThreadDetails = async (
  transaction: ITask<any>,
  {
    parentPostId,
    threadExternalId,
    firebaseId,
    parentCommentId,
    identityId,
    accessoryId,
  }: {
    firebaseId: string;
    parentPostId?: string;
    threadExternalId?: string;
    parentCommentId?: string;
    identityId?: string;
    accessoryId?: string;
  }
): Promise<{
  user_id: number;
  username: string;
  user_avatar: string;
  secret_identity_name: string;
  secret_identity_avatar: string;
  secret_identity_color: string;
  accessory_avatar?: string;
  thread_id: number;
  thread_external_id: string;
  post_id: number;
  comment_id: number;
  board_slug: string;
  board_external_id: string;
}> => {
  invariant(
    parentPostId || threadExternalId,
    "ParentPostId (${parentPostId}) or threadExternalId (${threadExternalId}) is required when getting details for a thread."
  );
  let {
    user_id,
    username,
    user_avatar,
    secret_identity_id,
    role_identity_id,
    secret_identity_name,
    secret_identity_avatar,
    secret_identity_color,
    accessory_avatar,
    thread_id,
    thread_external_id,
    post_id = null,
    comment_id = null,
    board_slug,
    board_external_id,
  } = await transaction.one(
    parentPostId ? sql.getPostDetails : sql.getThreadDetails,
    {
      post_string_id: parentPostId,
      thread_external_id: threadExternalId,
      firebase_id: firebaseId,
      parent_comment_string_id: parentCommentId,
    }
  );

  log(`Found details for thread:`);
  log({
    user_id,
    username,
    user_avatar,
    secret_identity_id,
    role_identity_id,
    secret_identity_name,
    secret_identity_avatar,
    thread_id,
    thread_external_id,
    post_id,
  });

  if (!role_identity_id && !secret_identity_id) {
    ({
      secret_identity_id,
      secret_identity_name,
      secret_identity_avatar,
      secret_identity_color,
      role_identity_id,
      accessory_avatar,
    } = await addNewIdentityToThreadByBoardId(transaction, {
      user_id,
      identityId: identityId || "",
      accessory_id: accessoryId,
      thread_id,
      firebaseId,
      board_external_id,
    }));
  }

  return {
    user_id,
    username,
    user_avatar,
    secret_identity_name,
    secret_identity_avatar,
    accessory_avatar,
    secret_identity_color,
    thread_id,
    thread_external_id,
    post_id,
    comment_id,
    board_slug,
    board_external_id,
  };
};

export const postNewContribution = async (
  {
    firebaseId,
    identityId,
    accessoryId,
    parentPostId,
    threadExternalId,
    content,
    anonymityType,
    whisperTags,
    indexTags,
    contentWarnings,
    categoryTags,
  }: {
    firebaseId: string;
    identityId?: string;
    accessoryId?: string;
    content: string;
    anonymityType: string;
    whisperTags: string[];
    indexTags: string[];
    categoryTags: string[];
    contentWarnings: string[];
    parentPostId?: string;
    threadExternalId?: string;
  },
  tx?: ITask<unknown>
): Promise<{ contribution: DbPostType; boardSlug: string } | false> => {
  const createContribution = async (
    t: ITask<unknown>
  ): Promise<{ contribution: DbPostType; boardSlug: string }> => {
    invariant(
      parentPostId || threadExternalId,
      `ParentPostId (${parentPostId}) or threadExternalId (${threadExternalId}) is required when creating a new contribution`
    );
    let {
      board_slug,
      board_external_id,
      user_id,
      username,
      user_avatar,
      secret_identity_name,
      secret_identity_avatar,
      secret_identity_color,
      accessory_avatar,
      thread_id,
      thread_external_id,
      post_id = null,
    } = await getThreadDetails(t, {
      identityId,
      accessoryId,
      parentPostId,
      threadExternalId,
      firebaseId,
    });
    const result = await t.one(sql.makePost, {
      post_string_id: uuidv4(),
      parent_post: post_id,
      parent_thread: thread_id,
      user_id,
      content,
      anonymity_type: anonymityType,
      whisper_tags: whisperTags,
    });
    log(`Added new contribution to thread ${thread_id}.`);
    log(result);

    const indexedTags = await maybeAddIndexTags(t, {
      postId: result.id,
      indexTags,
    });

    const categoryTagsResult = await maybeAddCategoryTags(t, {
      categoryTags,
      postId: result.id,
    });
    const contentWarningsResult = await maybeAddContentWarningTags(t, {
      contentWarnings,
      postId: result.id,
    });

    return {
      contribution: {
        post_id: result.string_id,
        parent_thread_id: thread_external_id,
        parent_post_id: parentPostId || null,
        parent_board_slug: board_slug,
        parent_board_id: board_external_id,
        author: user_id,
        username,
        user_avatar,
        secret_identity_name,
        secret_identity_avatar,
        secret_identity_color,
        accessory_avatar,
        created_at: result.created_at,
        content: result.content,
        type: result.type,
        whisper_tags: result.whisper_tags,
        index_tags: indexedTags,
        category_tags: categoryTagsResult,
        content_warnings: contentWarningsResult,
        anonymity_type: result.anonymity_type,
        total_comments_amount: 0,
        new_comments_amount: 0,
        comments: null,
        friend: false,
        self: true,
        is_new: true,
        is_own: true,
      },
      boardSlug: board_slug,
    };
  };
  return tx
    ? createContribution(tx)
    : pool.tx("create-contribution", createContribution);
};

export const postNewCommentWithTransaction = async ({
  firebaseId,
  parentPostId,
  parentCommentId,
  chainParentId,
  content,
  anonymityType,
  transaction,
  identityId,
  accessoryId,
}: {
  transaction?: ITask<any>;
  firebaseId: string;
  parentPostId: string;
  parentCommentId: string;
  chainParentId: number | null;
  content: string;
  anonymityType: string;
  identityId?: string;
  accessoryId?: string;
}): Promise<{ id: number; comment: DbCommentType }> => {
  let {
    user_id,
    username,
    user_avatar,
    secret_identity_name,
    secret_identity_avatar,
    secret_identity_color,
    accessory_avatar,
    thread_id,
    post_id,
    comment_id,
  } = await getThreadDetails(transaction!, {
    parentPostId,
    firebaseId,
    parentCommentId,
    identityId,
    accessoryId,
  });

  log(`Retrieved details for thread ${parentPostId}:`);
  log({
    user_id,
    username,
    user_avatar,
    secret_identity_name,
    secret_identity_avatar,
    thread_id,
    post_id,
    comment_id,
  });

  const result = await transaction!.one(sql.makeComment, {
    comment_string_id: uuidv4(),
    parent_post_id: post_id,
    parent_comment_id: comment_id,
    parent_thread_id: thread_id,
    chain_parent_comment_id: chainParentId,
    user_id,
    content,
    anonymity_type: anonymityType,
  });

  return {
    id: result.id,
    comment: {
      comment_id: result.string_id,
      parent_post_id: parentPostId,
      parent_comment_id: parentCommentId,
      chain_parent_id: result.chain_parent_comment_id,
      author: user_id,
      content: result.content,
      created_at: result.created_at,
      anonymity_type: result.anonymity_type,
      username,
      user_avatar,
      secret_identity_name,
      secret_identity_avatar,
      secret_identity_color,
      accessory_avatar,
      is_new: true,
      is_own: true,
      friend: false,
      self: true,
    },
  };
};

export const postNewCommentChain = async ({
  firebaseId,
  parentPostId,
  parentCommentId,
  contentArray,
  anonymityType,
  identityId,
  accessoryId,
}: {
  firebaseId: string;
  parentPostId: string;
  parentCommentId: string;
  contentArray: string[];
  anonymityType: string;
  identityId?: string;
  accessoryId?: string;
}): Promise<DbCommentType[] | false> => {
  return pool
    .tx("create-comment-chain", async (transaction) => {
      let prevId: number | null = null;
      let prevExternalId: string | null = null;
      const comments = [];
      for (let content of contentArray) {
        const newComment: { id: number; comment: DbCommentType } =
          await postNewCommentWithTransaction({
            firebaseId,
            parentPostId,
            parentCommentId,
            chainParentId: prevId,
            content,
            anonymityType,
            transaction,
            identityId,
            accessoryId,
          });
        newComment.comment.chain_parent_id = prevExternalId;
        prevId = newComment.id;
        prevExternalId = newComment.comment.comment_id;
        comments.push(newComment.comment);
      }
      return comments;
    })
    .catch((e) => {
      error(`Error while creating comment.`);
      error(e);
      return false;
    });
};

const addAccessoryToIdentity = async (
  transaction: ITask<any>,
  {
    identity_id,
    role_identity_id,
    accessory_id,
    thread_id,
  }: {
    identity_id: string;
    role_identity_id: string;
    accessory_id: string;
    thread_id: string;
  }
) => {
  invariant(
    identity_id || role_identity_id,
    "Accessory must be added to either identity or role identity"
  );
  // TODO: this is to get a random accessory for events.
  // Right now we only support actually choosing one.
  // const accessory = await transaction.one(sql.getRandomAccessory);

  const allowed_accessories =
    (await transaction.manyOrNone(sql.getUserAccessories)) || [];

  log(`allowed_accessories`, allowed_accessories);
  const selectedAccessory = allowed_accessories.find(
    (accessory) => accessory.string_id == accessory_id
  );
  if (!selectedAccessory) {
    throw new BadRequest400Error(
      "Selected accessory was not found for this user."
    );
  }

  await transaction.one(sql.addAccessoryToIdentity, {
    thread_id,
    identity_id,
    role_id: role_identity_id,
    accessory_id: selectedAccessory.id,
  });

  return {
    accessory_avatar: selectedAccessory.avatar,
  };
};

// TODO: rename to addNewIdentityToThread
export const addNewIdentityToThreadByBoardId = async (
  transaction: ITask<any>,
  {
    user_id,
    accessory_id,
    identityId,
    thread_id,
    firebaseId,
    board_external_id,
  }: {
    identityId: string;
    firebaseId: string;
    user_id: any;
    accessory_id?: string;
    board_external_id: any;
    thread_id: any;
  }
) => {
  let secret_identity_id = null;
  let role_identity_id = null;
  let secret_identity_name;
  let secret_identity_avatar;
  let secret_identity_color;

  if (identityId) {
    // An identity was passed to this method, which means we don't need to randomize it.
    // The only thing we need to check is whether the user is *actually able* to post
    // as that identity.
    const roleResult = await transaction.oneOrNone(
      threadsSql.getRoleByExternalIdAndBoardId,
      {
        role_id: identityId,
        firebase_id: firebaseId,
        board_external_id,
      }
    );
    if (!roleResult || !canPostAs(roleResult.permissions)) {
      throw new Forbidden403Error(
        `Attempted to post on thread with unauthorized identity for board ${board_external_id}.`
      );
    }
    role_identity_id = roleResult.id;
    secret_identity_name = roleResult.name;
    secret_identity_avatar = roleResult.avatar_reference_id;
    secret_identity_color = roleResult.color;
  } else {
    const randomIdentityResult = await transaction.one(sql.getRandomIdentity, {
      thread_id,
    });
    secret_identity_id = randomIdentityResult.secret_identity_id;
    secret_identity_name = randomIdentityResult.secret_identity_name;
    secret_identity_avatar = randomIdentityResult.secret_identity_avatar;
  }

  // The secret identity id is not currently in the thread data.
  // Add it.
  log(`Adding identity to thread:`);
  log({
    role_identity_id,
    secret_identity_id,
    secret_identity_name,
    secret_identity_avatar,
    secret_identity_color,
    accessory_id,
  });

  await transaction.one(sql.addIdentityToThread, {
    user_id,
    thread_id,
    secret_identity_id,
    role_identity_id,
  });

  let accessory_avatar = null;
  if (accessory_id) {
    ({ accessory_avatar } = await addAccessoryToIdentity(transaction, {
      identity_id: secret_identity_id,
      role_identity_id,
      thread_id,
      accessory_id,
    }));
  }

  return {
    secret_identity_id,
    secret_identity_name,
    secret_identity_avatar,
    role_identity_id,
    accessory_avatar,
    secret_identity_color,
  };
};

export const getPostByExternalId = async (
  transaction: ITask<any> | null,
  {
    firebaseId,
    postExternalId,
  }: {
    firebaseId: string | undefined;
    postExternalId: string;
  }
): Promise<DbPostType> => {
  return await (transaction ?? pool).one(sql.postByExternalId, {
    firebase_id: firebaseId,
    post_string_id: postExternalId,
  });
};

export const updatePostTags = async (
  transaction: ITask<any> | null,
  {
    firebaseId,
    postExternalId,
    tagsDelta,
  }: {
    firebaseId: string;
    postExternalId: string;
    tagsDelta: {
      added: QueryTagsType;
      removed: QueryTagsType;
    };
  }
): Promise<DbPostType | false> => {
  const updateTagsMethod = async (transaction: ITask<any>) => {
    const post = await getPostByExternalId(transaction, {
      firebaseId,
      postExternalId,
    });
    const numericId = (
      await transaction.one<{ id: number }>(sql.getPostIdFromExternalId, {
        post_string_id: postExternalId,
      })
    ).id;
    await maybeAddIndexTags(transaction, {
      indexTags: tagsDelta.added.indexTags,
      postId: numericId,
    });
    await removeIndexTags(transaction, {
      indexTags: tagsDelta.removed.indexTags,
      postId: numericId,
    });
    await maybeAddCategoryTags(transaction, {
      categoryTags: tagsDelta.added.categoryTags,
      postId: numericId,
    });
    await removeCategoryTags(transaction, {
      categoryTags: tagsDelta.removed.categoryTags,
      postId: numericId,
    });
    await maybeAddContentWarningTags(transaction, {
      contentWarnings: tagsDelta.added.contentWarnings,
      postId: numericId,
    });
    await removeContentWarningTags(transaction, {
      contentWarnings: tagsDelta.removed.contentWarnings,
      postId: numericId,
    });
    const newWhisperTags = post.whisper_tags
      .filter((tag) => !tagsDelta.removed.whisperTags.includes(tag))
      .concat(tagsDelta.added.whisperTags);
    await updateWhisperTags(transaction, {
      postId: numericId,
      whisperTags: newWhisperTags,
    });

    return await getPostByExternalId(transaction, {
      firebaseId,
      postExternalId,
    });
  };

  try {
    return await (transaction
      ? updateTagsMethod(transaction)
      : pool.tx("update-tags", updateTagsMethod));
  } catch (e) {
    log(e);
    return false;
  }
};
