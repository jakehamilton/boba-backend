import { BOBATAN_USER_ID, ZODIAC_KILLER_USER_ID } from "test/data/auth";

import { TWISTED_MINDS_REALM_EXTERNAL_ID } from "test/data/realms";
import { getBoards } from "../queries";

const extractBoardDetails = (boardData: any) => {
  return {
    avatar_reference_id: boardData.avatar_reference_id,
    settings: boardData.settings,
    slug: boardData.slug,
    external_id: boardData.string_id,
    realm_external_id: boardData.realm_external_id,
    tagline: boardData.tagline,
  };
};

const extractBoardUpdates = (boardData: any) => {
  return {
    slug: boardData.slug,
    external_id: boardData.string_id,
    realm_external_id: boardData.realm_external_id,
    has_updates: boardData.has_updates,
    last_comment: boardData.last_comment,
    last_post: boardData.last_post,
    last_visit: boardData.last_visit,
    last_activity: boardData.last_activity,
    last_activity_from_others: boardData.last_activity_from_others,
  };
};

const extractBoardUserSettings = (boardData: any) => {
  return {
    slug: boardData.slug,
    external_id: boardData.string_id,
    realm_external_id: boardData.realm_external_id,
    muted: boardData.muted,
    pinned_order: boardData.pinned_order,
  };
};

describe("Tests boards queries", () => {
  describe("Boards details", () => {
    test("fetches boards details(with user)", async () => {
      const boards = await getBoards({
        firebaseId: BOBATAN_USER_ID,
        realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      });

      expect(boards.map(extractBoardDetails)).toEqual([
        {
          avatar_reference_id: "villains.png",
          settings: {
            accentColor: "#ff5252",
          },
          slug: "main_street",
          external_id: "2fb151eb-c600-4fe4-a542-4662487e5496",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          tagline: "For BobaBoard-related discussions.",
        },
        {
          avatar_reference_id: "gore.png",
          settings: {
            accentColor: "#f96680",
          },
          slug: "gore",
          external_id: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          tagline: "Blood! Blood! Blood!",
        },
        {
          avatar_reference_id: "anime.png",
          settings: {
            accentColor: "#24d282",
          },
          slug: "anime",
          external_id: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          tagline: "I wish I had a funny one for this.",
        },
        {
          avatar_reference_id: "onceler-board.png",
          settings: {
            accentColor: "#00b8ff",
          },
          slug: "long",
          external_id: "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          tagline: "A board to test with many posts.",
        },
        {
          avatar_reference_id: "kink-meme.png",
          settings: {
            accentColor: "#7b00ff",
          },
          slug: "memes",
          external_id: "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          tagline: "A board to test collections view.",
        },
        {
          avatar_reference_id:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Feded338a-e0e5-4a97-a368-5ae525c0eec4?alt=media&token=914f84b7-a581-430e-bb09-695f653e8e02",
          settings: {
            accentColor: "#9b433b",
          },
          slug: "muted",
          external_id: "2bdce2fa-12e0-461b-b0fb-1a2e67227434",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          tagline: "A board to test for thread muting.",
        },
        {
          avatar_reference_id:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F7a4c4b8c-dce4-49ad-b292-f799473fbcd6?alt=media&token=f0aa1b5a-80ba-4c32-8bc3-5aa5633cf4e4",
          settings: {
            accentColor: "#00A0B0",
          },
          slug: "ssshh",
          external_id: "58a10fba-dd66-4862-83fd-c0a233c59599",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          tagline: "A board to test for board muting.",
        },
        {
          avatar_reference_id:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2Fe4e263cf-ee98-4902-9c14-c10299210e01.png?alt=media&token=7c170411-9401-4d4e-9f66-5d6dfee2fccd",
          settings: {
            accentColor: "#234a69",
          },
          slug: "restricted",
          external_id: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          tagline: "A board to test for logged-in only view",
        },
        {
          avatar_reference_id:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Fc3b86805-4df7-4b1a-9fa2-b96b5165a636?alt=media&token=7652d44a-38cb-40cc-82ef-908cd4265840",
          settings: {
            accentColor: "#fa8628",
          },
          slug: "delisted",
          external_id: "bb62b150-62ae-40a8-8ce2-7e5cdeae9d0b",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          tagline: "A board to test for link-only view",
        },
      ]);
    });
  });

  describe("Boards updates", () => {
    test("fetches all boards updates (with user)", async () => {
      const boards = await getBoards({
        firebaseId: BOBATAN_USER_ID,
        realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      });

      expect(boards.map(extractBoardUpdates)).toEqual([
        {
          slug: "main_street",
          external_id: "2fb151eb-c600-4fe4-a542-4662487e5496",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_activity: null,
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "gore",
          external_id: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 9, 4, 12, 44)),
          last_post: new Date(Date.UTC(2020, 8, 25, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 9, 4, 12, 44)),
          // Note: this will NOT be the same as last_comment, since that is from Bobatan
          last_activity_from_others: new Date(Date.UTC(2020, 9, 2, 12, 43)),
          last_visit: new Date(Date.UTC(2020, 4, 25, 16, 42)),
        },
        {
          slug: "anime",
          external_id: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_activity_from_others: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_visit: new Date(Date.UTC(2022, 4, 10, 16, 42)),
        },
        {
          slug: "long",
          external_id: "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 3, 1, 12, 22)),
          last_post: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_activity_from_others: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_visit: null,
        },
        {
          slug: "memes",
          external_id: "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
          last_activity: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "muted",
          external_id: "2bdce2fa-12e0-461b-b0fb-1a2e67227434",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_activity: null,
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "ssshh",
          external_id: "58a10fba-dd66-4862-83fd-c0a233c59599",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: null,
          last_post: new Date(Date.UTC(2022, 9, 24, 15, 40)),
          last_activity: new Date(Date.UTC(2022, 9, 24, 15, 40)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "restricted",
          external_id: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_activity_from_others: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_visit: null,
        },
        {
          slug: "delisted",
          external_id: "bb62b150-62ae-40a8-8ce2-7e5cdeae9d0b",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_activity: null,
          last_activity_from_others: null,
          last_visit: null,
        },
      ]);
    });
    test("fetches all boards updates (no user)", async () => {
      const boards = await getBoards({
        realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
        firebaseId: null,
      });

      expect(boards.map(extractBoardUpdates)).toEqual([
        {
          slug: "main_street",
          external_id: "2fb151eb-c600-4fe4-a542-4662487e5496",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_activity: null,
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "gore",
          external_id: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: new Date(Date.UTC(2020, 9, 4, 12, 44)),
          last_post: new Date(Date.UTC(2020, 8, 25, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 9, 4, 12, 44)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "anime",
          external_id: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "long",
          external_id: "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: new Date(Date.UTC(2020, 3, 1, 12, 22)),
          last_post: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "memes",
          external_id: "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
          last_activity: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "muted",
          external_id: "2bdce2fa-12e0-461b-b0fb-1a2e67227434",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 0, 14, 8, 42)),
          last_activity: new Date(Date.UTC(2020, 0, 14, 8, 42)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "ssshh",
          external_id: "58a10fba-dd66-4862-83fd-c0a233c59599",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: null,
          last_post: new Date(Date.UTC(2022, 9, 24, 15, 40)),
          last_activity: new Date(Date.UTC(2022, 9, 24, 15, 40)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "restricted",
          external_id: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "delisted",
          external_id: "bb62b150-62ae-40a8-8ce2-7e5cdeae9d0b",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_activity: null,
          last_activity_from_others: null,
          last_visit: null,
        },
      ]);
    });

    test("fetches all boards updates (dismissed notifications)", async () => {
      const boards = await getBoards({
        firebaseId: ZODIAC_KILLER_USER_ID,
        realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      });

      expect(boards.map(extractBoardUpdates)).toEqual([
        {
          slug: "main_street",
          external_id: "2fb151eb-c600-4fe4-a542-4662487e5496",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_activity: null,
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "gore",
          external_id: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 9, 4, 12, 44)),
          last_post: new Date(Date.UTC(2020, 8, 25, 12, 42)),
          // Note: this will be the same as last_comment, since that is from Bobatan
          last_activity: new Date(Date.UTC(2020, 9, 4, 12, 44)),
          last_activity_from_others: new Date(Date.UTC(2020, 9, 4, 12, 44)),
          last_visit: null,
        },
        {
          slug: "anime",
          external_id: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_activity_from_others: null,
          last_visit: new Date(Date.UTC(2020, 3, 26, 7, 0)),
        },
        {
          slug: "long",
          external_id: "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 3, 1, 12, 22)),
          last_post: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_activity_from_others: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_visit: new Date(Date.UTC(2020, 3, 24, 7, 0)),
        },
        {
          slug: "memes",
          external_id: "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: true,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
          last_activity: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
          last_activity_from_others: new Date(
            Date.UTC(2020, 7, 22, 10, 36, 55, 850)
          ),
          last_visit: null,
        },
        {
          slug: "muted",
          external_id: "2bdce2fa-12e0-461b-b0fb-1a2e67227434",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 0, 14, 8, 42)),
          last_activity: new Date(Date.UTC(2020, 0, 14, 8, 42)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "ssshh",
          external_id: "58a10fba-dd66-4862-83fd-c0a233c59599",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: true,
          last_comment: null,
          last_post: new Date(Date.UTC(2022, 9, 24, 15, 40)),
          last_activity: new Date(Date.UTC(2022, 9, 24, 15, 40)),
          last_activity_from_others: new Date(Date.UTC(2022, 9, 24, 15, 40)),
          last_visit: null,
        },
        {
          slug: "restricted",
          external_id: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_activity_from_others: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_visit: null,
        },
        {
          slug: "delisted",
          external_id: "bb62b150-62ae-40a8-8ce2-7e5cdeae9d0b",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_activity: null,
          last_activity_from_others: null,
          last_visit: null,
        },
      ]);
    });
  });

  describe("User settings", () => {
    test("fetches all boards (with user)", async () => {
      const boards = await getBoards({
        firebaseId: BOBATAN_USER_ID,
        realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      });

      expect(boards.map(extractBoardUserSettings)).toEqual([
        {
          slug: "main_street",
          external_id: "2fb151eb-c600-4fe4-a542-4662487e5496",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: null,
        },
        {
          slug: "gore",
          external_id: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: "1",
        },
        {
          slug: "anime",
          external_id: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: "2",
        },
        {
          slug: "long",
          external_id: "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: null,
        },
        {
          slug: "memes",
          external_id: "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: null,
        },
        {
          slug: "muted",
          external_id: "2bdce2fa-12e0-461b-b0fb-1a2e67227434",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: null,
        },
        {
          slug: "ssshh",
          external_id: "58a10fba-dd66-4862-83fd-c0a233c59599",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: true,
          pinned_order: null,
        },
        {
          slug: "restricted",
          external_id: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: null,
        },
        {
          slug: "delisted",
          external_id: "bb62b150-62ae-40a8-8ce2-7e5cdeae9d0b",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: null,
        },
      ]);
    });
    test("fetches all boards user settings (no user)", async () => {
      const boards = await getBoards({
        firebaseId: null,
        realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      });

      expect(boards.map(extractBoardUserSettings)).toEqual([
        {
          slug: "main_street",
          external_id: "2fb151eb-c600-4fe4-a542-4662487e5496",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: null,
        },
        {
          slug: "gore",
          external_id: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: null,
        },
        {
          slug: "anime",
          external_id: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: null,
        },
        {
          slug: "long",
          external_id: "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: null,
        },
        {
          slug: "memes",
          external_id: "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: null,
        },
        {
          slug: "muted",
          external_id: "2bdce2fa-12e0-461b-b0fb-1a2e67227434",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: null,
        },
        {
          slug: "ssshh",
          external_id: "58a10fba-dd66-4862-83fd-c0a233c59599",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: null,
        },
        {
          slug: "restricted",
          external_id: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: null,
        },
        {
          slug: "delisted",
          external_id: "bb62b150-62ae-40a8-8ce2-7e5cdeae9d0b",
          realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
          muted: false,
          pinned_order: null,
        },
      ]);
    });
  });

  describe("When this fails, please update the tests above too", () => {
    // If this test fails it's because new fields have likely been added
    // that aren't tested by the above methods. Add the new field to the
    // appropriate "extration" method so it can be captured by the other tests.
    test("fetches all boards (with user)", async () => {
      const boards = await getBoards({
        firebaseId: BOBATAN_USER_ID,
        realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      });

      expect(boards[0]).toEqual({
        avatar_reference_id: "villains.png",
        has_updates: false,
        last_comment: null,
        last_post: null,
        last_visit: null,
        last_activity: null,
        last_activity_from_others: null,
        pinned_order: null,
        muted: false,
        settings: {
          accentColor: "#ff5252",
        },
        slug: "main_street",
        string_id: "2fb151eb-c600-4fe4-a542-4662487e5496",
        realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
        tagline: "For BobaBoard-related discussions.",
        logged_in_base_restrictions: [],
        logged_out_restrictions: [],
      });
    });
  });
});
