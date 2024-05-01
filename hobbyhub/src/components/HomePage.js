import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function HomePage({ searchQuery }) {
    const [posts, setPosts] = useState([]);
    const [sortType, setSortType] = useState('created_at');

    useEffect(() => {
        async function getPosts() {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order(sortType, { ascending: false });

        if (error) {
            console.log('Error fetching posts', error);
        } else {
            setPosts(data);
        }
        }

        getPosts();
    }, [sortType]);

    // Filtering posts based on the search query
    const filteredPosts = posts.filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div style={{ padding: '20px' }}>
        <h1>Posts</h1>
        <div className='sorts'>
            <button onClick={() => setSortType('created_at')}>Sort by Date</button>
            <button onClick={() => setSortType('upvotes')}>Sort by Upvotes</button>
        </div>
        {posts.length > 0 ? (
            filteredPosts.map(post => (
            <div key={post.id} style={{ border: '1px solid #ddd', padding: '20px', margin: '10px 0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h3><Link to={`/posts/${post.id}`}>{post.title}</Link></h3>
                <p>Posted on: {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString()}</p>
                <p>Upvotes: {post.upvotes}</p>
            </div>
            ))
        ) : (
            <p>No posts found. Maybe create some?</p>
        )}
        <Link to="/create-post">Create a New Post</Link>
        </div>
    );
}

export default HomePage;
