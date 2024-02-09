import { FastifyInstance } from "fastify";
import { voting } from "../../utils/volting-pub-sub";
import { z } from "zod";

export async function pollResult(app: FastifyInstance){
  app.get("/polls/:pollId/result",{websocket:true}, (connection, request) => {
    const getPollParams = z.object({
      pollId: z.string().uuid()
    });
  
    const {pollId}  = getPollParams.parse(request.params);
   
    voting.subscribe(pollId, (message) => {
      connection.socket.send(JSON.stringify(message));
    });

  });
}
