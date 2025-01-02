import react, { useMemo } from "react";
import io from "socket.io-client";

const useSocket = (url) => {
  return useMemo(() => io(url), [url]);
};

export default useSocket;
