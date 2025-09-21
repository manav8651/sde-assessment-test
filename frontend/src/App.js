import React, { useRef } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import TaskList from "./components/TaskList";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const taskListRef = useRef();

  const handleNewTask = () => {
    if (taskListRef.current) {
      taskListRef.current.openNewTaskForm();
    }
  };

  const handleShowStats = () => {
    // TODO: Implement stats modal
    console.log("Show stats clicked");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Header onNewTask={handleNewTask} onShowStats={handleShowStats} />
        <main className="main-content">
          <TaskList ref={taskListRef} />
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;
