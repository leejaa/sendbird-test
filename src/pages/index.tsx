import { Box, Button } from "@mui/material";
import { LiveEvent, LiveEventState, LiveEventType } from "@sendbird/live";
import { SendbirdLive } from "@sendbird/live";
import { useEffect, useRef, useState } from "react";

export const APP_ID = "EE662E70-97B5-412A-86A9-7A5F304F59CD";

export default function Home() {
  const [liveEvent, setLiveEvent] = useState<LiveEvent | null>(null);

  const videoRef = useRef<any>(null);

  const CreateLiveEvent = async () => {
    try {
      const newLiveEvent = await SendbirdLive.createLiveEvent({
        userIdsForHost: ["jahum"],
        title: "라이브스트리밍 테스트",
        coverUrl:
          "https://mblogthumb-phinf.pstatic.net/MjAxOTA1MDdfMjc1/MDAxNTU3MjE5MTgzMjY5.DQwQpQFlVNGMsF0xgb8CnD0ZxU6eUcXt7gfBPqinEkMg.NoSOhwRQP5FlCP3UIjaGonLyXc-gphDAsaZvdK0au1sg.PNG.cine_play/%ED%94%BC%EC%B9%B4%EC%B8%842.png?type=w800",
        type: LiveEventType.LIVE_EVENT_FOR_VIDEO,
      });
      console.log("newLiveEvent", newLiveEvent);
      setLiveEvent(newLiveEvent);
    } catch (error) {
      console.log("error", error);
    }
  };

  const sendbirdliveinit = async () => {
    SendbirdLive.init({ appId: APP_ID });

    try {
      const result = await SendbirdLive.authenticate("jahum");
      console.log("result", result);
      // The user has been authenticated successfully and is connected to Sendbird server.
    } catch (error2) {
      console.log("error", error2);
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

  console.log(
    "liveEvent && liveEvent.state !== LiveEventState.ONGOING",
    liveEvent && liveEvent.state !== LiveEventState.ONGOING
  );

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
