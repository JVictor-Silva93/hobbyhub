import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function PostDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const titleRef = useRef(null);
    const contentRef = useRef(null);

    const fetchPostDetails = useCallback(async () => {
        setLoading(true);
        try {
            const { data: postData, error: postError } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();
            if (postError) {
                console.error('Error fetching post:', postError);
                setError('Failed to fetch post details.');
                return;
            }

            if (!postData) {
                setError('No post found.');
                return;
            }

            setPost(postData);
            const { data: commentsData, error: commentsError } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', id);

            if (commentsError) {
                console.error('Error fetching comments:', commentsError);
                return;
            }

            setComments(commentsData);
        } catch (error) {
            console.error('Error:', error.message);
            setError('Failed to fetch post details.');
        } finally {
            setLoading(false);
        }
    }, [id]); // include `id` because it is used inside the function

    useEffect(() => {
        fetchPostDetails();
    }, [fetchPostDetails]);

    async function handleUpvote() {
        if (!post) return;
        try {
        const newUpvotes = post.upvotes + 1;
        const { error } = await supabase
            .from('posts')
            .update({ upvotes: newUpvotes })
            .match({ id: post.id });

        if (error) {
            console.error('Error upvoting post:', error.message);
            return;
        }

        setPost(prevPost => ({ ...prevPost, upvotes: newUpvotes }));
        } catch (error) {
        console.error('Error:', error.message);
        }
    }

    async function handleAddComment() {
        if (!newComment.trim()) return;

        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
        console.error('User not authenticated');
        return;
        }

        const newCommentData = {
        post_id: id,
        text: newComment.trim(),
        created_at: new Date().toISOString(),
        user_id: userId,
        };

        const { error } = await supabase.from('comments').insert([newCommentData], { returning: "representation" });
        if (error) {
        console.error('Error adding comment:', error.message);
        return;
        }

        setNewComment('');
        setComments(prevComments => [...prevComments, newCommentData]); // Optimistically update comments
    }

    async function handleUpdate() {
        const updatedTitle = titleRef.current.value;
        const updatedContent = contentRef.current.value;
        const { error } = await supabase
          .from('posts')
          .update({ title: updatedTitle, content: updatedContent })
          .eq('id', id);
        if (error) {
          console.error('Error updating post:', error);
          return;
        }
    
        setIsEditing(false);
        fetchPostDetails();  // Refresh post details
    }

    async function handleDelete() {
        const { error } = await supabase
            .from('posts')
            .delete()
            .match({ id });
        if (error) {
            console.error('Error deleting post:', error);
        } else {
            navigate('/');
        }
    }

    if (loading) {
        return (
            <div className="loader">
                <div></div> {/* This is the actual spinner element */}
            </div>
        );
    }
    if (error) return <p>{error}</p>;

    return (
        <div className='flex'>
            {loading ? <p>Loading post details...</p> : error ? <p>{error}</p> : (
                <div>
                    {post ? (
                        <div>
                            <h1>{isEditing ? <input ref={titleRef} defaultValue={post.title} /> : post.title}</h1>
                            {post.imageUrl && <img src={post.imageUrl} alt="Post" />}
                            <p>{isEditing ? <textarea ref={contentRef} defaultValue={post.content} /> : post.content}</p>
                            <p>Upvotes: {post.upvotes}</p>
                            <div className='post-details-buttons'>
                                {isEditing ? (
                                    <>
                                        <button onClick={handleUpdate}>Save</button>
                                        <button onClick={() => setIsEditing(false)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setIsEditing(true)}>Edit</button>
                                        <button onClick={handleDelete}>Delete</button>
                                    </>
                                )}
                                <button onClick={handleUpvote}>Upvote</button>
                            </div>
                            <div>
                                <h3>Comments</h3>
                                <ul>
                                    {comments.map(comment => <li key={comment.id}>{comment.text}</li>)}
                                    {comments.length === 0 && <p>No comments yet.</p>}
                                </ul>
                                <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." />
                                <button onClick={handleAddComment}>Submit Comment</button>
                            </div>
                        </div>
                    ) : <p>No post found.</p>}
                    <Link to="/">Back to Posts</Link>
                </div>
            )}
        </div>
    );    
}

export default PostDetails;
