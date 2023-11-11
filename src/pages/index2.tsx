import { Box, Button } from "@mui/material";
import { LiveEvent, LiveEventState, LiveEventType } from "@sendbird/live";
import { SendbirdLive } from "@sendbird/live";
import { useEffect, useMemo, useRef, useState } from "react";
import SendbirdChat, { BaseChannel } from "@sendbird/chat";
import {
  OpenChannelHandler,
  OpenChannelModule,
  SendbirdOpenChat,
} from "@sendbird/chat/openChannel";
import { BaseMessage } from "@sendbird/chat/message";

export const APP_ID = "EE662E70-97B5-412A-86A9-7A5F304F59CD";
export const USER_ID = "jahum";

export default function Home() {
  const [liveEvent, setLiveEvent] = useState<LiveEvent | null>(null);

  const [sb, setSb] = useState<SendbirdOpenChat | null>(null);

  const videoRef = useRef<any>(null);

  const CreateLiveEvent = async () => {
    try {
      const newLiveEvent = await SendbirdLive.createLiveEvent({
        userIdsForHost: [USER_ID],
        title: "라이브스트리밍 테스트",
        coverUrl:
          "https://mblogthumb-phinf.pstatic.net/MjAxOTA1MDdfMjc1/MDAxNTU3MjE5MTgzMjY5.DQwQpQFlVNGMsF0xgb8CnD0ZxU6eUcXt7gfBPqinEkMg.NoSOhwRQP5FlCP3UIjaGonLyXc-gphDAsaZvdK0au1sg.PNG.cine_play/%ED%94%BC%EC%B9%B4%EC%B8%842.png?type=w800",
        type: LiveEventType.LIVE_EVENT_FOR_VIDEO,
      });

      if (sb) {
        console.log(
          "newLiveEvent.openChannel.url",
          newLiveEvent.openChannel.url
        );

        const channel = await sb.openChannel.getChannel(
          newLiveEvent.openChannel.url
        );

        await channel.enter();

        sb.openChannel.addOpenChannelHandler(
          "abcd",
          new OpenChannelHandler({
            onMessageReceived: (channel: BaseChannel, message: BaseMessage) => {
              console.log("channel", channel);
              console.log("message", message);
            },
          })
        );
      }
      console.log("newLiveEvent", newLiveEvent);
      setLiveEvent(newLiveEvent);
    } catch (error) {
      console.log("error", error);
    }
  };

  const sendbirdliveinit = async () => {
    SendbirdLive.init({ appId: APP_ID });

    try {
      const result = await SendbirdLive.authenticate(USER_ID);
      console.log("result", result);
      // The user has been authenticated successfully and is connected to Sendbird server.
    } catch (error2) {
      console.log("error", error2);
    }

    try {
      const newSb = SendbirdChat.init({
        appId: APP_ID,
        modules: [new OpenChannelModule()],
      }) as SendbirdOpenChat;

      console.log("newSb", newSb);

      const user = await newSb.connect(USER_ID);

      console.log("user", user);

      setSb(newSb);
    } catch (error3) {
      console.log("error3", error3);
    }
  };

  const enterAsHost = async () => {
    if (liveEvent) {
      try {
        const result = await liveEvent.enterAsHost({
          turnAudioOn: true,
          turnVideoOn: true,
        });
        console.log("result", result);
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  const startEvent = async () => {
    if (liveEvent) {
      try {
        const result = await liveEvent.startEvent({
          turnAudioOn: true,
          turnVideoOn: true,
        });
        console.log("result", result);
      } catch (error) {
        console.log("error", error);
      }

      console.log("liveEvent.hosts[0].hostId", liveEvent.hosts[0].hostId);

      try {
        liveEvent.setMediaViewForLiveEvent(
          videoRef.current,
          liveEvent.hosts[0].hostId
        );
      } catch (error2) {
        console.log("error2", error2);
      }
    }
  };

  return (
    <Box height="100vh" width="100vw">
      {liveEvent?.state !== LiveEventState.ONGOING && (
        <>
          <Button onClick={sendbirdliveinit}>Init Live Event</Button>
          <Button onClick={CreateLiveEvent}>Create Live Event</Button>
          <Button onClick={enterAsHost}>Enter as Host</Button>
          <Button onClick={startEvent}>Start Event</Button>
        </>
      )}
      <video
        ref={videoRef}
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "black",
          objectFit: "fill",
        }}
        id="video"
        autoPlay
      ></video>
    </Box>
  );
}
