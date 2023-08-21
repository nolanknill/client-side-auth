import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.authToken);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) {
      return ;
    }
    
    axios
      .get("http://localhost:8080/posts", {
        headers: {
          Authorization: `Bearer ${sessionStorage.authToken}`
        }
      })
      .then((response) => {
        setPosts(response.data);
      })
      .catch((error) => {
        setIsLoggedIn(false);
      });
  }, [isLoggedIn]);

  const handleLogin = (event) => {
    event.preventDefault();

    axios
      .post("http://localhost:8080/login", { 
        username: event.target.username.value, 
        password: event.target.password.value
      })
      .then((response) => {
        sessionStorage.authToken = response.data.token;

        setIsLoggedIn(true);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    setIsLoggedIn(false);
  }

  if (!isLoggedIn) {
    return (
      <form onSubmit={handleLogin}>
        <div>
          <label>Username: <input type="text" name="username" /></label>
        </div>
        <div>
          <label>Password: <input type="password" name="password" /></label>
        </div>
        <div>
          <button>Log In</button>
        </div>
      </form>
    )
  }
  
  return (
    <section>
      <h2>My Posts:</h2>
      {posts.map((post) => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </article>
      ))}
      <button onClick={handleLogout}>Log Out</button>
    </section>
  )
}

export default App;
