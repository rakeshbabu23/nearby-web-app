import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import io from "socket.io-client"; // Import socket.io-client directly
import styles from "./ChatScreen.module.css";
import { useAuth } from "../../contexts/Auth/AuthContext";
import { X as CloseIcon, Send as SendIcon } from "lucide-react";
function getRoomName(userId1, userId2) {
  return [userId1, userId2].sort().join("_");
}
const ChatScreen = ({ person, onClose }) => {
  const scrollRef = useRef(null);
  const { user } = useAuth();
  const receiverId = person.receiverDetails._id;
  const chatId = null;
  const roomName = getRoomName(user._id, receiverId);

  const [messages, setMessages] = useState([]);
  console.log("setMessages", messages);

  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  // Initialize socket connection
  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessageTime = (timestamp) => {
    return moment(timestamp).format("hh:mm A");
  };

  const fetchRecentMessages = (
    socket,
    senderId,
    receiverId,
    chatId,
    pageToFetch = 1
  ) => {
    socket.emit("fetch_recent_messages", {
      senderId,
      receiverId,
      chatId,
      pageToFetch,
    });
  };
  useEffect(() => {
    // Create socket instance
    const socket = io(process.env.API_URL, {
      transports: ["websocket"],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    socket.on("connect", () => {
      setSocketConnected(true);
      setConnectionError(null);

      // Join room and register user after successful connection
      socket.emit(
        "join_room",
        {
          senderId: user._id,
          receiverId,
        },
        (response) => {
          console.log("join_room response:", response);
        }
      );

      socket.emit(
        "register_user",
        {
          userId: user._id,
        },
        (response) => {
          console.log("register_user response:", response);
        }
      );
    });

    socket.on("connect_error", (error) => {
      console.error("Connection Error:", error);
      setConnectionError(error.message);
      setSocketConnected(false);
    });

    socket.on("disconnect", (reason) => {
      setSocketConnected(false);
    });

    // Message event handlers
    socket.on("recent_messages", (data) => {
      setMessages(data.messages || []);
    });

    socket.on("new_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    socket.emit("user_online_status", {
      roomName,
      userId: user._id,
      receiverId,
    });
    fetchRecentMessages(socket, user._id, receiverId, chatId);

    socketRef.current = socket;

    return () => {
      if (socket) {
        socket.emit("leave_room", { roomName });
        socket.disconnect();
      }
    };
  }, [user._id, receiverId, roomName]);

  const sendMessage = (text) => {
    if (!text.trim() || !socketRef.current?.connected) {
      console.log("Cannot send message:", {
        textExists: !!text.trim(),
        socketExists: !!socketRef.current,
        socketConnected: socketRef.current?.connected,
      });
      return;
    }

    socketRef.current.emit("send_message", {
      senderId: user._id,
      receiverId,
      chatId,
      text,
    });
  };

  const handleSendMessage = () => {
    if (!socketConnected) {
      console.log("Socket not connected. Cannot send message.");
      return;
    }
    sendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {person.receiverDetails.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className={styles.userMeta}>
              <h2 className={styles.userName}>
                {person.receiverDetails.name || "User"}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className={styles.messageContainer}>
        {messages.map((message) => {
          const isOwn = message.senderId.toString() === user._id.toString();
          return (
            <div
              key={message.id}
              className={`${styles.messageWrapper} ${
                isOwn ? styles.ownMessage : styles.otherMessage
              }`}
            >
              <div className={styles.messageContent}>
                <p className={styles.messageText}>{message.text}</p>
                <p className={styles.messageTime}>
                  {`\n ${formatMessageTime(message.createdAt)}`}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className={styles.inputWrapper}>
        <div className={styles.inputContent}>
          <input
            type="text"
            placeholder={
              socketConnected ? "Type a message..." : "Connecting..."
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!socketConnected}
            className={styles.input}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={!socketConnected || !newMessage.trim()}
            className={styles.sendButton}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
