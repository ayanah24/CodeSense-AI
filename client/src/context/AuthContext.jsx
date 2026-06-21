import { createContext, useContext, useEffect, useState } from "react";

const API= import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AuthContext = createContext(null);

export function AuthProvider({children}){
    const [user,setUser] = useState(null);
    const [loading , setLoading] = useState(true);

    useEffect(()=>{
        //checking auth status on app load
        fetch(`${API}/auth/me`,{credentials:'include'})
        .then(r=>r.ok?r.json():null)
        .then(data=>{
            setUser(data || false);
            setLoading(false);
        })
        .catch(()=>{
            setUser(false);
            setLoading(false);
        });
    },[]);

    async function logout(){
        await fetch(`${API}/auth/logout`,{
            method:'POST',
            credentials:'include',
        });
        setUser(false);
    }

    return(
        <AuthContext.Provider value={{user,loading,logout,setUser}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    return useContext(AuthContext);
}