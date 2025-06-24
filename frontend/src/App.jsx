import { useState } from 'react'

import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUpPage from './pages/auth/signup/SignUpPage'
import LoginPage from './pages/auth/login/LoginPage'
import HomePage from './pages/home/HomePage'
import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'
import NotificationPage from './pages/notification/NotificationPage'
import ProfilePage from './pages/profile/ProfilePage'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from './components/common/LoadingSpinner'

function App() {
    const  {data: authUser, isLoading, isError, error} = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            try {
                const response = await fetch("/api/auth/me", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }
                const data = await response.json();
                return data;
            } catch (error) {

                console.error("Error fetching user data:", error);
                throw error;
            }
        },
        retry: false,
    });

    if (isLoading) {
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner size='lg'/>
        </div>;
    }

  return (
    <>
    <div className='flex max-w-6xl mx-auto'>
      {authUser && <Sidebar/> }
       <Routes>
      <Route path="/" element={ authUser ? <HomePage/> : <Navigate to="/login"/> } />
      <Route path="/signup" element={ !authUser ? <SignUpPage/> : <Navigate to="/" /> }/>
      <Route path="/login" element={ !authUser ? <LoginPage/> : <Navigate to="/"/> } />
      <Route path="/notification" element={
        authUser ? <NotificationPage/> : <Navigate to="/login"/> } />
    
      <Route path="/profile/:username" element={ 
        authUser ? <ProfilePage/> : <Navigate to="/login"/> } />
       </Routes>
      
        {authUser && <RightPanel/> }
       <Toaster/>
    </div>
   
    </>
   
  )
}

export default App
