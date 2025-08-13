import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Download,
  Eye,
  Calendar,
  Share2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ChevronDown,
  ChevronUp,
  Settings,
  Clock,
  Captions,
} from "lucide-react";
import LoadingSkeleton from "../components/common/loading_skeleton";
import MovieCard from "../components/common/movie_card";
import { useApp } from "../contexts/app_context";
import { useAuth } from "../contexts/auth_context";
import toast from "react-hot-toast";


const Watch = () => {
  const [search_params] = useSearchParams();
  const navigate = useNavigate();
  const { api_request, getComments, saveComment, deleteComment, hitComment } =
    useApp();
  const { user } = useAuth();
  const video_ref = useRef(null);
  const video_container_ref = useRef(null);
  const controls_timeout_ref = useRef(null);
  const descriptionRef = useRef(null);
  const seek_preview_ref = useRef(null);
  const buffer_animation_ref = useRef(null);

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionClamped, setIsDescriptionClamped] = useState(false);

  const movie_id = search_params.get("v_id");
  const [movie, set_movie] = useState(null);
  const [linked_series, set_linked_series] = useState([]);
  const [recommended_movies, set_recommended_movies] = useState([]);
  const [loading, set_loading] = useState(true);
  const [loading_series, set_loading_series] = useState(false);
  const [loading_recommended, set_loading_recommended] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentActionLoading, setCommentActionLoading] = useState({});
  const [currentCommentPage, setCurrentCommentPage] = useState(1);
  const commentsPerPage = 5;

  // Video player state
  const [playing, set_playing] = useState(false);
  const [muted, set_muted] = useState(false);
  const [volume, set_volume] = useState(0.7);
  const [current_time, set_current_time] = useState(0);
  const [duration, set_duration] = useState(0);
  const [buffered, set_buffered] = useState(0);
  const [show_controls, set_show_controls] = useState(true);
  const [fullscreen, set_fullscreen] = useState(false);
  const [is_seeking, set_is_seeking] = useState(false);
  const [playback_rate, set_playback_rate] = useState(1);
  const [is_loading_video, set_is_loading_video] = useState(true);
  const [error, set_error] = useState(null);
  const [show_settings, set_show_settings] = useState(false);
  const [show_seek_preview, set_show_seek_preview] = useState(false);
  const [seek_preview_time, set_seek_preview_time] = useState(0);
  const [show_speed_menu, set_show_speed_menu] = useState(false);

  // Infinite scroll for recommended
  const [loadedRecommendedIdx, setLoadedRecommendedIdx] = useState(12);
  const recommendedBatchSize = 6;
  const [loadingMoreRecommended, setLoadingMoreRecommended] = useState(false);

  // Check if description is clamped
  useEffect(() => {
    if (descriptionRef.current) {
      setIsDescriptionClamped(
        descriptionRef.current.scrollHeight >
          descriptionRef.current.clientHeight
      );
    }
  }, [movie?.description]);



  // Load comments when movie changes
  useEffect(() => {
    if (movie && movie._id) {
      loadComments();
    }
  }, [movie]);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const response = await getComments(movie._id);
      if (response.data && response.data.success) {
        setComments(response.data.comments || []);
      } else {
        setComments([]);
      }
    } catch (e) {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommentSubmitting(true);
    try {
      const response = await saveComment({
        movie_id: movie._id,
        user_id: user?.name,
        comment: commentInput.trim(),
      });
      if (response.data && response.data.success) {
        toast.success("Comment added!");
        setCommentInput("");
        loadComments();
        setCurrentCommentPage(1); // Reset to first page
      } else {
        toast.error(response.data?.error || "Failed to add comment");
      }
    } catch (e) {
      toast.error("Failed to add comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setCommentActionLoading((prev) => ({ ...prev, [commentId]: true }));
    try {
      const response = await deleteComment(commentId);
      if (response.data && (response.data.success || response.data.status)) {
        toast.success("Comment deleted");
        loadComments();
      } else {
        toast.error(response.data?.error || "Failed to delete comment");
      }
    } catch (e) {
      toast.error("Failed to delete comment");
    } finally {
      setCommentActionLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleLikeDislike = async (commentId, action) => {
    setCommentActionLoading((prev) => ({ ...prev, [commentId]: true }));
    try {
      const response = await hitComment({
        comment_id: commentId,
        user_id: user?.name,
        action,
      });
      if (response.data && response.data.status) {
        toast.success(response.data.message);
        loadComments();
      } else {
        toast.error(response.data?.error || "Failed to update comment");
      }
    } catch (e) {
      toast.error("Failed to update comment");
    } finally {
      setCommentActionLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // Paginated comments
  const paginatedComments = comments.slice(
    (currentCommentPage - 1) * commentsPerPage,
    currentCommentPage * commentsPerPage
  );

  const totalCommentPages = Math.ceil(comments.length / commentsPerPage);

  const handleNextComments = () => {
    if (currentCommentPage < totalCommentPages) {
      setCurrentCommentPage(currentCommentPage + 1);
    }
  };

  const handlePrevComments = () => {
    if (currentCommentPage > 1) {
      setCurrentCommentPage(currentCommentPage - 1);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handle_keydown = (e) => {
      if (!video_ref.current) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          handle_play_pause();
          break;
        case "k":
          e.preventDefault();
          handle_play_pause();
          break;
        case "ArrowRight":
          e.preventDefault();
          handle_seek(Math.min(current_time + 5, duration));
          break;
        case "ArrowLeft":
          e.preventDefault();
          handle_seek(Math.max(current_time - 5, 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          handle_volume_change(Math.min(volume + 0.1, 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          handle_volume_change(Math.max(volume - 0.1, 0));
          break;
        case "m":
          e.preventDefault();
          handle_mute_toggle();
          break;
        case "f":
          e.preventDefault();
          handle_fullscreen();
          break;
        case "t":
          e.preventDefault();
          handle_toggle_subtitles();
          break;
        case "c":
          e.preventDefault();
          handle_toggle_captions();
          break;
        case ">":
        case ".":
          e.preventDefault();
          handle_frame_step(true);
          break;
        case "<":
        case ",":
          e.preventDefault();
          handle_frame_step(false);
          break;
      }
    };

    document.addEventListener("keydown", handle_keydown);
    return () => document.removeEventListener("keydown", handle_keydown);
  }, [current_time, duration, volume]);

  // Auto-hide controls
  useEffect(() => {
    if (!playing) return;

    const hide_controls = () => {
      if (show_controls) {
        controls_timeout_ref.current = setTimeout(() => {
          set_show_controls(false);
          set_show_settings(false);
          set_show_speed_menu(false);
        }, 3000);
      }
    };

    hide_controls();
    return () => clearTimeout(controls_timeout_ref.current);
  }, [playing, show_controls]);

  // Handle fullscreen change events
  useEffect(() => {
    const handle_fullscreen_change = () => {
      set_fullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handle_fullscreen_change);
    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handle_fullscreen_change
      );
    };
  }, []);

  useEffect(() => {
    if (movie_id) {
      load_movie();
    } else {
      navigate("/");
    }
  }, [movie_id]);

  useEffect(() => {
    if (movie) {
      load_linked_series();
      load_recommended_movies();
      increment_views();
    }
  }, [movie]);

  const load_movie = async () => {
    try {
      set_loading(true);
      set_error(null);
      const response = await api_request("GET", `/movies/${movie_id}`);
      if (response.data.success) {
        set_movie(response.data.movie);
      } else {
        toast.error("Movie not found");
        navigate("/");
      }
    } catch (error) {
      toast.error("Failed to load movie");
      navigate("/");
    } finally {
      set_loading(false);
    }
  };

  const load_linked_series = async () => {
    if (!movie?.linked_serie) return;

    try {
      set_loading_series(true);
      const response = await api_request(
        "GET",
        `/series/${movie_id}/${movie.linked_serie}`
      );
      if (response.data.success) {
        set_linked_series(response.data.linked_series || []);
      }
    } catch (error) {
      console.error("Failed to load linked series");
    } finally {
      set_loading_series(false);
    }
  };

  const load_recommended_movies = async () => {
    if (!movie?.genre) return;

    try {
      set_loading_recommended(true);
      const response = await api_request("GET", `/genre/${movie.genre}`);
      if (response.data.success) {
        const movies = response.data.movies || [];
        set_recommended_movies(
          movies
            .filter((m) => m._id !== movie_id)
            .slice(0, loadedRecommendedIdx)
        );
      }
    } catch (error) {
      console.error("Failed to load recommended movies");
    } finally {
      set_loading_recommended(false);
    }
  };

  const loadMoreRecommended = async () => {
    if (!movie?.genre || loadingMoreRecommended) return;

    try {
      setLoadingMoreRecommended(true);
      const response = await api_request("GET", `/genre/${movie.genre}`);
      if (response.data.success) {
        const movies = response.data.movies || [];
        const newMovies = movies
          .filter((m) => m._id !== movie_id)
          .slice(
            loadedRecommendedIdx,
            loadedRecommendedIdx + recommendedBatchSize
          );

        set_recommended_movies((prev) => [...prev, ...newMovies]);
        setLoadedRecommendedIdx((prev) => prev + recommendedBatchSize);
      }
    } catch (error) {
      console.error("Failed to load more recommended movies");
    } finally {
      setLoadingMoreRecommended(false);
    }
  };

  const increment_views = async () => {
    try {
      await api_request("POST", `/views/${movie_id}`);
    } catch (error) {
      console.error("Failed to increment views");
    }
  };



  const handle_download = async () => {
    if (!movie?.download_url) return;

    try {
      await api_request("POST", `/downloads/${movie_id}`);

      const link = document.createElement("a");
      link.href = movie.download_url;
      link.download = movie.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started!");
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const handle_share = () => {
    const share_url = `${window.location.origin}/watch?v_id=${movie_id}`;
    if (navigator.share) {
      navigator
        .share({
          title: movie.name,
          text: `Watch "${movie.name}" on our platform`,
          url: share_url,
        })
        .catch(() => {
          navigator.clipboard.writeText(share_url);
          toast.success("Share link copied to clipboard!");
        });
    } else {
      navigator.clipboard.writeText(share_url);
      toast.success("Share link copied to clipboard!");
    }
  };

  const handle_play_pause = () => {
    if (video_ref.current) {
      if (playing) {
        video_ref.current.pause();
      } else {
        video_ref.current.play().catch((err) => {
          set_error("Failed to play video. Please check your connection.");
          console.error("Playback error:", err);
        });
      }
      set_playing(!playing);
    }
  };

  const handle_volume_change = (new_volume) => {
    if (video_ref.current) {
      video_ref.current.volume = new_volume;
      set_volume(new_volume);
      set_muted(new_volume === 0);
    }
  };

  const handle_mute_toggle = () => {
    if (video_ref.current) {
      const new_muted = !muted;
      video_ref.current.muted = new_muted;
      set_muted(new_muted);
    }
  };

  const handle_seek = (new_time) => {
    if (video_ref.current) {
      video_ref.current.currentTime = new_time;
      set_current_time(new_time);
    }
  };

  const handle_fullscreen = () => {
    const video_container = video_container_ref.current;
    if (video_container) {
      if (!fullscreen) {
        if (video_container.requestFullscreen) {
          video_container.requestFullscreen();
        } else if (video_container.webkitRequestFullscreen) {
          video_container.webkitRequestFullscreen();
        } else if (video_container.msRequestFullscreen) {
          video_container.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    }
  };

  const handle_playback_rate_change = (rate) => {
    if (video_ref.current) {
      video_ref.current.playbackRate = rate;
      set_playback_rate(rate);
      set_show_speed_menu(false);
    }
  };




  const handle_toggle_subtitles = () => {
    toast("Subtitles feature coming soon");
  };

  const handle_toggle_captions = () => {
    toast("Closed captions feature coming soon");
  };

  const handle_frame_step = (forward) => {
    if (!video_ref.current) return;

    try {
      // Attempt to step frame by frame (may not work in all browsers)
      if (forward) {
        video_ref.current.currentTime += 1 / 30; // Approximate 30fps
      } else {
        video_ref.current.currentTime -= 1 / 30;
      }
    } catch (e) {
      console.error("Frame stepping not supported");
    }
  };

  const format_time = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handle_video_click = () => {
    set_show_controls(true);
    handle_play_pause();
  };

  const handle_video_hover = () => {
    set_show_controls(true);
    clearTimeout(controls_timeout_ref.current);
  };

  const handle_video_leave = () => {
    if (playing) {
      controls_timeout_ref.current = setTimeout(() => {
        set_show_controls(false);
        set_show_settings(false);
        set_show_speed_menu(false);
      }, 2000);
    }
  };

  const handle_progress = () => {
    if (video_ref.current && video_ref.current.buffered.length > 0) {
      set_buffered(video_ref.current.buffered.end(0));
    }
  };

  const handle_seek_hover = (e) => {
    if (!video_ref.current || !duration) return;

    const progress_bar = e.currentTarget;
    const rect = progress_bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seek_time = pos * duration;

    set_seek_preview_time(seek_time);
    set_show_seek_preview(true);
  };

  const handle_seek_leave = () => {
    set_show_seek_preview(false);
  };

  // Generate hex color from username
  const getUsernameColor = (username) => {
    if (!username) return "#6b7280"; // Default gray if no username

    // Simple hash function to convert string to hex color
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    const color = `hsl(${hash % 360}, 70%, 50%)`;
    return color;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <LoadingSkeleton className="w-full aspect-video bg-gray-800 mb-6" />
          <LoadingSkeleton className="w-3/4 h-8 bg-gray-800 mb-4" />
          <LoadingSkeleton className="w-1/2 h-6 bg-gray-800" />
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-8">
        {/* Main Content Grid - YouTube-like layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column - Player and Info (Primary Content) */}
          <div className="flex-1">
            {/* Video Player Container */}
            <div
              ref={video_container_ref}
              className="relative bg-black rounded-none lg:rounded-lg overflow-hidden group"
              onMouseEnter={handle_video_hover}
              onMouseLeave={handle_video_leave}
            >
              {/* Video Element */}
              <video
                ref={video_ref}
                src={movie.watch_url}
                poster={movie.thumbnail_image}
                className="w-full h-auto aspect-video"
                controls={false}
                muted={muted}
                onTimeUpdate={(e) => set_current_time(e.target.currentTime)}
                onLoadedMetadata={(e) => {
                  set_duration(e.target.duration);
                  set_is_loading_video(false);
                  // Set initial volume and playback rate via ref
                  if (video_ref.current) {
                    video_ref.current.volume = volume;
                    video_ref.current.playbackRate = playback_rate;
                  }
                }}
                onProgress={handle_progress}
                onPlay={() => {
                  set_playing(true);
                  set_is_loading_video(false);
                }}
                onPause={() => set_playing(false)}
                onWaiting={() => set_is_loading_video(true)}
                onPlaying={() => set_is_loading_video(false)}
                onError={() => {
                  set_error("Failed to load video. Please try again later.");
                  set_is_loading_video(false);
                }}
                onClick={handle_video_click}
              />

              {/* Loading Indicator */}
              {is_loading_video && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">{error}</p>
                    <button
                      onClick={() => {
                        set_error(null);
                        video_ref.current.load();
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Video Controls Overlay */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  show_controls ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Top Gradient */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/70 to-transparent pointer-events-none"></div>

                {/* Bottom Gradient and Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 space-y-3">
                  {/* Progress Bar */}
                  <div
                    className="relative w-full h-2 bg-gray-600/50 rounded-full cursor-pointer group/progress"
                    onMouseMove={handle_seek_hover}
                    onMouseLeave={handle_seek_leave}
                  >
                    <div
                      className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(current_time / duration) * 100}%` }}
                    ></div>
                    <div
                      className="absolute top-0 left-0 h-full bg-gray-400/30 rounded-full"
                      style={{ width: `${(buffered / duration) * 100}%` }}
                    ></div>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={current_time}
                      onChange={(e) => {
                        set_is_seeking(true);
                        set_current_time(parseFloat(e.target.value));
                      }}
                      onMouseUp={(e) => {
                        handle_seek(parseFloat(e.target.value));
                        set_is_seeking(false);
                      }}
                      onTouchEnd={(e) => {
                        handle_seek(parseFloat(e.target.value));
                        set_is_seeking(false);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                      className={`absolute h-3 w-3 bg-indigo-500 rounded-full -translate-y-1/2 top-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity`}
                      style={{ left: `${(current_time / duration) * 100}%` }}
                    ></div>

                    {/* Seek Preview Tooltip */}
                    {show_seek_preview && (
                      <div
                        ref={seek_preview_ref}
                        className="absolute -top-8 transform -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap"
                        style={{
                          left: `${(seek_preview_time / duration) * 100}%`,
                        }}
                      >
                        {format_time(seek_preview_time)}
                      </div>
                    )}
                  </div>

                  {/* Control Bar */}
                  <div className="flex items-center justify-between">
                    {/* Left Controls */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Play/Pause */}
                      <button
                        onClick={handle_play_pause}
                        className="text-white hover:text-indigo-300 transition-colors"
                        aria-label={playing ? "Pause" : "Play"}
                      >
                        {playing ? (
                          <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </button>

                      {/* Volume */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={handle_mute_toggle}
                          className="text-white hover:text-indigo-300 transition-colors"
                          aria-label={muted ? "Unmute" : "Mute"}
                        >
                          {muted ? (
                            <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
                          ) : (
                            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={muted ? 0 : volume}
                          onChange={(e) =>
                            handle_volume_change(parseFloat(e.target.value))
                          }
                          className="w-16 sm:w-24 accent-indigo-500"
                          aria-label="Volume"
                        />
                      </div>

                      {/* Time */}
                      <div className="text-sm sm:text-base font-mono">
                        {format_time(current_time)} / {format_time(duration)}
                      </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Settings Menu */}
                      <div className="relative">
                        <button
                          onClick={() => set_show_settings(!show_settings)}
                          className="text-white hover:text-indigo-300 transition-colors"
                          aria-label="Settings"
                        >
                          <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        {/* Settings Dropdown */}
                        {show_settings && (
                          <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-md shadow-lg z-20 w-48">
                            <button
                              onClick={() => {
                                set_show_speed_menu(!show_speed_menu);
                              }}
                              className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-700 text-sm"
                            >
                              <span>Playback Speed</span>
                              <span>{playback_rate}x</span>
                            </button>
                            <button
                              onClick={handle_toggle_subtitles}
                              className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-700 text-sm"
                            >
                              <span>Subtitles</span>
                              <span>Off</span>
                            </button>
                            <button
                              onClick={handle_toggle_captions}
                              className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-700 text-sm"
                            >
                              <span>Captions</span>
                              <span>Off</span>
                            </button>
                          </div>
                        )}

                        {/* Playback Speed Menu */}
                        {show_speed_menu && (
                          <div className="absolute bottom-full right-0 mb-2 mr-12 bg-gray-800 rounded-md shadow-lg z-20 w-32">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                              <button
                                key={rate}
                                onClick={() => handle_playback_rate_change(rate)}
                                className={`block w-full px-4 py-2 text-left text-sm ${
                                  playback_rate === rate
                                    ? "bg-indigo-600"
                                    : "hover:bg-gray-700"
                                }`}
                              >
                                {rate}x
                              </button>
                            ))}
                          </div>
                        )}


                      </div>

                      {/* Fullscreen */}
                      <button
                        onClick={handle_fullscreen}
                        className="text-white hover:text-indigo-300 transition-colors"
                        aria-label={
                          fullscreen ? "Exit fullscreen" : "Fullscreen"
                        }
                      >
                        {fullscreen ? (
                          <Minimize className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <Maximize className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Movie Info Section */}
            <div className="px-4 lg:px-0 py-6 space-y-6">
              {/* Title and Metadata */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-3">
                  {movie.name}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{movie.views?.toLocaleString() || 0} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>
                      {movie.download_count?.toLocaleString() || 0} downloads
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{movie.release_date || "N/A"}</span>
                  </div>
                  <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm">
                    {movie.genre}
                  </div>
                  {movie.is_interpreted && movie.interpreter && (
                    <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                      Interpreted: {movie.interpreter}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={handle_download}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={handle_share}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>

                {/* Description with toggle */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div
                    ref={descriptionRef}
                    className={`text-gray-300 transition-all ${
                      showFullDescription ? "" : "line-clamp-3"
                    }`}
                  >
                    {movie.description}
                  </div>
                  {isDescriptionClamped && (
                    <button
                      onClick={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mt-2 flex items-center"
                    >
                      {showFullDescription ? (
                        <>
                          Show less <ChevronUp className="ml-1 w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Show more <ChevronDown className="ml-1 w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    Comments {comments.length > 0 ? `(${comments.length})` : ""}
                  </h2>
                  {comments.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>
                        Page {currentCommentPage} of {totalCommentPages}
                      </span>
                      <button
                        onClick={handlePrevComments}
                        disabled={currentCommentPage === 1}
                        className="text-indigo-400 hover:text-indigo-300 disabled:text-gray-600"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNextComments}
                        disabled={currentCommentPage === totalCommentPages}
                        className="text-indigo-400 hover:text-indigo-300 disabled:text-gray-600"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Add Comment Form */}
                {user ? (
                  <form onSubmit={handleAddComment} className="flex gap-2 mb-6">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: getUsernameColor(user.name) }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
                        placeholder="Add a comment..."
                        maxLength={500}
                        disabled={commentSubmitting}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-full text-sm font-medium disabled:opacity-50"
                          disabled={commentSubmitting || !commentInput.trim()}
                        >
                          {commentSubmitting ? "Posting..." : "Comment"}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="mb-6 text-gray-400">Sign in to comment.</div>
                )}

                {/* Comments List */}
                {commentsLoading ? (
                  <div className="space-y-4">
                    {Array(3)
                      .fill()
                      .map((_, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-3 w-full bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-3 w-2/3 bg-gray-700 rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : paginatedComments.length === 0 ? (
                  <div className="text-gray-400">No comments yet.</div>
                ) : (
                  <div className="space-y-4">
                    {paginatedComments.map((comment) => (
                      <div key={comment._id} className="flex gap-3">
                        <div
                          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                          style={{
                            backgroundColor: getUsernameColor(comment?.name),
                          }}
                        >
                          {comment?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {comment?.name || "User"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-300 my-1">
                            {comment.comment}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <button
                              className={`flex items-center gap-1 ${
                                comment.liked_by?.includes(user?.name)
                                  ? "text-indigo-500"
                                  : "hover:text-indigo-400"
                              }`}
                              onClick={() =>
                                handleLikeDislike(comment._id, "like")
                              }
                              disabled={commentActionLoading[comment._id]}
                            >
                              <span>👍</span> {comment.likes || 0}
                            </button>
                            <button
                              className={`flex items-center gap-1 ${
                                comment.disliked_by?.includes(user?.name)
                                  ? "text-red-500"
                                  : "hover:text-red-400"
                              }`}
                              onClick={() =>
                                handleLikeDislike(comment._id, "dislike")
                              }
                              disabled={commentActionLoading[comment._id]}
                            >
                              <span>👎</span> {comment.dislikes || 0}
                            </button>
                            {user && comment.user_id?._id === user._id && (
                              <button
                                className="text-red-500 hover:text-red-400"
                                onClick={() => handleDeleteComment(comment._id)}
                                disabled={commentActionLoading[comment._id]}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Series Section */}
              {movie.is_serie && movie.linked_serie && (
                <div className="pt-4">
                  <h2 className="text-xl font-semibold mb-4">
                    Series Episodes
                  </h2>
                  {loading_series ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {Array(8)
                        .fill()
                        .map((_, index) => (
                          <LoadingSkeleton
                            key={index}
                            className="h-40 bg-gray-800"
                          />
                        ))}
                    </div>
                  ) : linked_series.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {linked_series.map((episode) => (
                        <div
                          key={episode._id}
                          onClick={() => navigate(`/watch?v_id=${episode._id}`)}
                          className="cursor-pointer group"
                        >
                          <div className="relative overflow-hidden rounded-lg mb-2 aspect-video">
                            <img
                              src={episode.thumbnail_image}
                              alt={episode.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                              <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                              <p className="text-xs text-white truncate">
                                {episode.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No episodes found</p>
                  )}
                </div>
              )}

              {/* Recommended Section - Moved here from right column */}
              <div className="pt-4">
                <h2 className="text-xl font-semibold mb-4">Recommended</h2>
                {loading_recommended ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Array(6)
                      .fill()
                      .map((_, index) => (
                        <LoadingSkeleton
                          key={index}
                          className="h-40 bg-gray-800"
                        />
                      ))}
                  </div>
                ) : recommended_movies.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {recommended_movies.map((rec_movie) => (
                        <div
                          key={rec_movie._id}
                          onClick={() =>
                            navigate(`/watch?v_id=${rec_movie._id}`)
                          }
                          className="cursor-pointer group"
                        >
                          <div className="relative overflow-hidden rounded-lg mb-2 aspect-video">
                            <img
                              src={rec_movie.thumbnail_image}
                              alt={rec_movie.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                              <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-indigo-400 transition-colors">
                            {rec_movie.name}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            {rec_movie.views?.toLocaleString() || 0} views
                          </p>
                        </div>
                      ))}
                    </div>
                    {recommended_movies.length >= loadedRecommendedIdx && (
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={loadMoreRecommended}
                          disabled={loadingMoreRecommended}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm flex items-center gap-2"
                        >
                          {loadingMoreRecommended ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "Load More"
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400">No recommendations available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
