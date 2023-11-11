import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { LiveEvent, LiveEventState, LiveEventType } from "@sendbird/live";
import { SendbirdLive } from "@sendbird/live";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SendbirdChat, { BaseChannel } from "@sendbird/chat";
import {
  OpenChannel,
  OpenChannelHandler,
  OpenChannelModule,
  SendbirdOpenChat,
} from "@sendbird/chat/openChannel";
import { BaseMessage } from "@sendbird/chat/message";
import { v4 } from "uuid";

export const APP_ID = "EE662E70-97B5-412A-86A9-7A5F304F59CD";
export const USER_ID = "jahum";

export default function Home() {
  const [sb, setSb] = useState<SendbirdOpenChat>();
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [chats, setChats] = useState<string[]>([]);
  const [currentChannel, setCurrentChannel] = useState<OpenChannel>();

  const initializeLive = useCallback(async () => {
    try {
      SendbirdLive.init({ appId: APP_ID });

      await SendbirdLive.authenticate(USER_ID);

      makeLiveEvents();
    } catch (error) {
      console.log(error);
      alert("live 초기화 실패");
    }
  }, []);

  const initializeChat = async () => {
    try {
      const newSb = SendbirdChat.init({
        appId: APP_ID,
        modules: [new OpenChannelModule()],
      }) as SendbirdOpenChat;

      await newSb.connect(USER_ID);

      setSb(newSb);
    } catch (error3) {
      alert("chat 초기화 실패");
    }
  };

  const makeLiveEvents = async () => {
    try {
      const query = SendbirdLive.createLiveEventListQuery({
        limit: 10,
        types: [LiveEventType.LIVE_EVENT_FOR_VIDEO],
      });

      const newLiveEvents = await query.next();
      setLiveEvents(newLiveEvents);
    } catch (error) {
      alert("live chat 리스트 조회 실패");
    }
  };

  const handleMessageReceived = (channel: BaseChannel, message: any) => {
    console.log("message received..");
    setChats((prev) => [...prev, message.message]);
  };

  const enterChatChannel = async (url: string) => {
    if (!sb) {
      return;
    }
    try {
      const channel = await sb.openChannel.getChannel(url);

      const prevChats = await channel.getMessagesByTimestamp(10000, {
        nextResultSize: 100,
        prevResultSize: 100,
      });

      setChats((prev) =>
        prev.concat(prevChats.map((item: any) => item.message))
      );

      await channel.enter();

      sb.openChannel.addOpenChannelHandler(
        "abcd",
        new OpenChannelHandler({
          onMessageReceived: handleMessageReceived,
        })
      );

      setCurrentChannel(channel);
    } catch (error) {
      alert("open channel 입장 실패");
    }
  };

  const makeLiveEvent = async (index: number) => {
    setCurrentIndex(index);

    console.log("liveEvents[index]", liveEvents[index]);

    await enterChatChannel(liveEvents[index].openChannel.url);
  };

  const handleKeyDown = async (event: any) => {
    console.log("event", event);
    if (event.code === "Enter") {
      console.log("currentChannel", currentChannel);
      await currentChannel?.sendUserMessage({
        message: event.target.value,
      });

      event.target.value = "";
    }
  };

  useEffect(() => {
    initializeChat();
  }, [initializeLive]);

  return (
    <Stack direction={"column"}>
      {liveEvents.length === 0 && (
        <Button onClick={initializeLive}>라이브방송 리스트 조회</Button>
      )}
      {currentIndex === -1 &&
        liveEvents.length > 0 &&
        liveEvents.map((item, index) => (
          <Button key={v4()} onClick={() => makeLiveEvent(index)}>
            {item.title}
          </Button>
        ))}
      {currentIndex !== -1 && (
        <Stack direction="column">
          {chats.map((item) => (
            <Typography key={v4()}>{item}</Typography>
          ))}
          <TextField onKeyDown={handleKeyDown} />
        </Stack>
      )}
    </Stack>
  );
}
