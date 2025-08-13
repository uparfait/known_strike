
const Router = require('express').Router();
const auth = require('../Middleware/auth.js');

// Skeleton controllers
const add_movie = require('../Controllers/skeleton/add_movie.js');
const delete_movie = require('../Controllers/skeleton/delete_movie.js');
const find_by_genre = require('../Controllers/skeleton/find_by_genre.js');
const find_linked_serie = require('../Controllers/skeleton/find_linked_serie.js');
const find_movie_by_id = require('../Controllers/skeleton/find_movie_by_id.js');
const find_next_popular = require('../Controllers/skeleton/find_next_popular.js');
const find_popular_movie = require('../Controllers/skeleton/find_popular_movie.js');
const get_user_info = require('../Controllers/skeleton/get_user_info.js');
const initial_get_movie = require('../Controllers/skeleton/initial_get_movie.js');
const load_next_movies = require('../Controllers/skeleton/load_next_movies.js');
const load_next_related_movies = require('../Controllers/skeleton/load_next_related_movies.js');
const load_next_search = require('../Controllers/skeleton/load_next_search.js');
const load_related_genre = require('../Controllers/skeleton/load_related_genre.js');
const login = require('../Controllers/skeleton/login.js');
const search_movie = require('../Controllers/skeleton/search_movie.js');
const update_movie = require('../Controllers/skeleton/update_movie.js');
const view_all_users = require('../Controllers/skeleton/view_all_users.js');
const get_total_downloads = require('../Controllers/skeleton/get_total_downloads.js');
const get_total_users = require('../Controllers/skeleton/get_total_users.js');
const get_total_views = require('../Controllers/skeleton/get_total_views.js');
const get_total_movies_along_genres = require('../Controllers/skeleton/get_total_movies_along_genres.js');
const get_total_movies = require('../Controllers/skeleton/get_total_movies.js');
const add_genre = require('../Controllers/skeleton/add_genre.js');
const delete_genre = require('../Controllers/skeleton/delete_genre.js');
const load_next_genre = require('../Controllers/skeleton/load_next_genre.js');
const view_all_logs = require('../Controllers/skeleton/view_all_logs.js');
const clear_all_logs = require('../Controllers/skeleton/clear_all_logs.js');
// Comment controllers
const get_movie_comments = require('../Controllers/skeleton/get_movie_comments.js');
const save_movie_comment = require('../Controllers/skeleton/save_movie_comment.js');
const hit_comment = require('../Controllers/skeleton/hit_comment.js');
const delete_comment = require('../Controllers/skeleton/delete_comment.js');

// System controllers
const get_all_genres = require('../Controllers/system/get_all_genres.js');
const increment_download_count = require('../Controllers/system/increment_download_count.js');
const increment_views = require('../Controllers/system/increment_views.js');
const search_suggestion = require('../Controllers/system/search_suggestion.js');

// Authentication routes (no auth required)
Router.post('/login', login);

// Comments routes (auth required)
Router.get('/comments/:movie_id', auth, get_movie_comments);
Router.post('/comment', auth, save_movie_comment);
Router.post('/comments', auth, hit_comment);
Router.delete('/comment/:id', auth, delete_comment);

// User info routes (auth required)
Router.get('/user', auth, get_user_info);

// Movie management routes (auth required)
Router.post('/movies', auth, add_movie);
Router.get('/movies', auth, initial_get_movie);
Router.post('/movies/next', auth, load_next_movies);
Router.get('/movies/:id', auth, find_movie_by_id);
Router.put('/movies/:id', auth, update_movie);
Router.delete('/movies/:id', auth, delete_movie);

// Search routes (auth required)
Router.get('/search', auth, search_movie);
Router.post('/search/next', auth, load_next_search);

// Genre routes (auth required)
Router.get('/genres', auth, get_all_genres);
Router.get('/genre/:genre', auth, find_by_genre);
Router.post('/add/genre', auth, add_genre);
Router.delete('/genre/:id', auth, delete_genre);
Router.post('/next/genre', auth, load_next_genre);

// Popular movies routes (auth required)
Router.get('/popular', auth, find_popular_movie);
Router.post('/popular/next', auth, find_next_popular);

// Related movies routes (auth required)
Router.post('/related', auth, load_related_genre);
Router.post('/related/next', auth, load_next_related_movies);

// Series routes (auth required)
Router.get('/series/:id/:linked_serie', auth, find_linked_serie);

// System interaction routes (auth required)
Router.post('/views/:id', auth, increment_views);
Router.post('/downloads/:id', auth, increment_download_count);
Router.get('/suggestions', auth, search_suggestion);

// User management routes (auth required)
Router.get('/users', auth, view_all_users);

// Statistics routes (auth required)
Router.get('/total_downloads', auth, get_total_downloads);
Router.get('/total_users', auth, get_total_users);
Router.get('/total_views', auth, get_total_views);
Router.get('/movie_counts', auth, get_total_movies_along_genres);
Router.get('/total_movies', auth, get_total_movies);

// Log management routes (auth required)
Router.get('/logs', auth, view_all_logs);
Router.delete('/logs', auth, clear_all_logs);

module.exports = Router;
