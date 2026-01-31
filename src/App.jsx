import { useState, useEffect } from "react";
import "./App.css";



const Header = ({ name, avatar, stats }) => {
  const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  
  return (
    <header className="header">
      <img src={avatar} alt="avatar" className="avatar" />
      <h2>Задачи: {name}</h2>
      <div className="stats-container">
        <p>Всего: {stats.total} | Активные: {stats.active} | Выполнено: {stats.done}</p>
        <div className="progress-bg">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <small>Прогресс: {progress}%</small>
      </div>
    </header>
  );
};

const TodoItem = ({ todo, onDelete, onToggle, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleDoubleClick = () => setIsEditing(true);

  const handleSave = () => {
    onUpdate(todo.id, editText);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  return (
    <div className={`card ${todo.completed ? "completed" : ""}`}>
      <div className="card-main">
        <input 
          type="checkbox" 
          checked={todo.completed} 
          onChange={() => onToggle(todo.id)} 
        />
        {isEditing ? (
          <input
            className="edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <span onDoubleClick={handleDoubleClick}>{todo.text}</span>
        )}
      </div>
      <button className="del-btn" onClick={() => onDelete(todo.id)}>×</button>
    </div>
  );
};



export default function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all"); 
  const [sort, setSort] = useState("newest"); 

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);


  const addTodo = (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    const newTodo = { id: Date.now(), text, completed: false };
    setTodos([newTodo, ...todos]);
    setText("");
  };

  const deleteTodo = (id) => setTodos(todos.filter(t => t.id !== id));

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const updateTodo = (id, newText) => {
    setTodos(todos.map(t => t.id === id ? { ...t, text: newText } : t));
  };


  const filteredTodos = todos
    .filter(t => {
      if (filter === "active") return !t.completed;
      if (filter === "done") return t.completed;
      return true;
    })
    .sort((a, b) => {
      if (sort === "alpha") return a.text.localeCompare(b.text);
      return b.id - a.id; 
    });

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    done: todos.filter(t => t.completed).length
  };

  return (
    <div className="container">
      <Header name="Елизавета" avatar="/avatar.jpg" stats={stats} />
      
      <form onSubmit={addTodo} className="todo-form">
        <input 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="Напиши задачу и нажми Enter" 
        />
        <button type="submit">Добавить</button>
      </form>

      <div className="controls">
        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="all">Все задачи</option>
          <option value="active">Только активные</option>
          <option value="done">Только выполненные</option>
        </select>
        <select onChange={(e) => setSort(e.target.value)} value={sort}>
          <option value="newest">Сначала новые</option>
          <option value="alpha">По алфавиту</option>
        </select>
      </div>

      <div className="list">
        {filteredTodos.map(todo => (
          <TodoItem 
            key={todo.id} 
            todo={todo} 
            onDelete={deleteTodo} 
            onToggle={toggleTodo} 
            onUpdate={updateTodo}
          />
        ))}
      </div>
    </div>
  );
}
