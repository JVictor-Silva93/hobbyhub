import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function CreatePost() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Fetch the user details when the component mounts using the new method
        async function checkUserSession() {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user);

            // Optionally, handle redirection if no user is found
            if (!session || !session.user) {
                console.log("No user logged in, redirecting...");
                navigate('/login'); // Redirect to login or another appropriate route
            }
        }

        checkUserSession();
    }, [navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!user) {
            console.log("No user logged in, cannot create post.");
            return; // Early return if no user is logged in
        }

        const { data, error } = await supabase.from('posts').insert([
            {
                title,
                content,
                image_url: imageURL,
                user_id: user.id // Ensure user_id is included if your RLS policies require it
            }
        ]);

        if (error) {
            console.log('Error creating post', error);
        } else {
            console.log('Post created!', data);
            navigate('/'); // Redirect to homepage after post creation
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" required />
            <input type="text" value={imageURL} onChange={e => setImageURL(e.target.value)} placeholder="Image URL" />
            <button type="submit">Create Post</button>
        </form>
    );
}

export default CreatePost;
