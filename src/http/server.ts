import fastify from "fastify";
import cookie from "@fastify/cookie";
import websocket from "@fastify/websocket";
import { createPoll } from "./routers/create-post";
import { getPoll } from "./routers/get-post";
import { voteOnPoll } from "./routers/vote-on-post";
import { pollResult } from "./ws/poll-result";


const app = fastify();

app.register(cookie, {
  secret: "polls-app-nlw",
  hook: 'onRequest',
});

app.register(websocket);

app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll); 

app.register(pollResult);

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running!")
})
