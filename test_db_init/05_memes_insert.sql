
INSERT INTO threads (string_id,parent_board,options) VALUES 
('2765f36a-b4f9-4efe-96f2-cb34f055d032',5,'{"default_view": "gallery"}');
INSERT INTO posts (string_id,parent_thread,parent_post,author,created,"content","type",whisper_tags,"options",is_deleted,anonymity_type) VALUES 
('b2c57275-512e-4821-8cf8-b3ac76e1e044',31,NULL,1,'2020-08-22 03:34:39.806','[{"insert":"Somnium Files Funny Memes"},{"attributes":{"header":2},"insert":""}]','text','{}','{"wide": false}',false,'everyone')
,('d14e311a-a22a-4673-8b8a-cd0423e38a3c',31,35,1,'2020-08-22 03:35:03.191','[{"insert":{"block-image":{"src":"https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmemes%2F2765f36a-b4f9-4efe-96f2-cb34f055d032%2F45c75c3e-1086-4e72-8742-549335cdfbff?alt=media&token=97efd46b-f464-4620-a1d1-a97f61e96d91","spoilers":false,"width":1280,"height":720}}},{"insert":""}]','text','{}','{"wide": false}',false,'strangers')
,('a16d4b39-4e63-434f-9502-3c1e67cb253b',31,35,1,'2020-08-22 03:35:24.049','[{"insert":{"block-image":{"src":"https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmemes%2F2765f36a-b4f9-4efe-96f2-cb34f055d032%2F768fced9-5f46-42f0-8aeb-ad135b412ae9?alt=media&token=0840c22f-0781-4a83-8f17-f41338772c99","spoilers":false,"width":690,"height":388}}},{"insert":""}]','text','{}','{"wide": false}',false,'strangers')
,('41b1ed49-2235-431d-bbf5-d7bd304a2d60',31,35,1,'2020-08-22 03:35:44.507','[{"insert":{"block-image":{"src":"https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmemes%2F2765f36a-b4f9-4efe-96f2-cb34f055d032%2F0c9c7e0e-2bc0-4a71-9c6e-201890f8bbf8?alt=media&token=caa232a5-9cb6-46c7-8968-c979364d255d","spoilers":false,"width":3840,"height":2160}}},{"insert":""}]','text','{}','{"wide": false}',false,'strangers')
,('7f76ddaf-06f0-44fa-85d5-2e5ad5d447aa',31,35,1,'2020-08-22 03:36:18.729','[{"insert":{"block-image":{"src":"https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmemes%2F2765f36a-b4f9-4efe-96f2-cb34f055d032%2F7707f104-044c-4111-b422-74e11ccef4a2?alt=media&token=7cdf3edb-0d63-467e-ade6-05447cc602c3","spoilers":false,"width":1920,"height":1080}}},{"insert":""}]','text','{}','{"wide": false}',false,'strangers')
,('03a71721-12a6-488d-ab25-3b6b7c947a67',31,35,1,'2020-08-22 03:36:55.850','[{"insert":{"block-image":{"src":"https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmemes%2F2765f36a-b4f9-4efe-96f2-cb34f055d032%2F894374bd-fed2-42af-a21e-18ed9c5040fc?alt=media&token=f5afda1f-2a14-43a3-9717-7cdc0aeddc2d","spoilers":false,"width":3840,"height":2160}}},{"insert":""}]','text','{}','{"wide": false}',false,'strangers');

INSERT INTO categories(category) VALUES 
  ('aiba');
INSERT INTO post_categories(post_id, category_id) VALUES
 ((SELECT id FROM posts WHERE string_id = 'd14e311a-a22a-4673-8b8a-cd0423e38a3c'),
  (SELECT id FROM categories WHERE category = 'aiba')),
 ((SELECT id FROM posts WHERE string_id = '7f76ddaf-06f0-44fa-85d5-2e5ad5d447aa'),
  (SELECT id FROM categories WHERE category = 'aiba'));