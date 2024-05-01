import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Navbar({ setSearchQuery }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user);
        };

        fetchSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user);
        });

        // Cleanup function for the listener
        return () => {
            if (authListener?.unsubscribe) {
                authListener.unsubscribe();
            } else {
                // Log or handle cases where unsubscribe might not be a function
                console.error("Error: unsubscribe function not found on the authListener object.");
            }
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#333', color: '#fff' }}>
            <h1>HobbyHub</h1>
            <input
                type="text"
                placeholder="Search posts..."
                onChange={(e) => setSearchQuery(e.target.value)} 
            />
            <div>
                <Link to="/" style={{ marginRight: '10px', color: '#fff' }}>Home</Link>
                <Link to="/create-post" style={{ marginRight: '10px', color: '#fff' }}>Create Post</Link>
                {user ? (
                    <button onClick={handleLogout} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
                ) : (
                    <Link to="/login" style={{ color: '#fff' }}>Login</Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;