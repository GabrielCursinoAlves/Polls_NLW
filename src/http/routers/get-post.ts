import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { redis } from "../../lib/redis";

export async function getPoll(app: FastifyInstance){

app.get("/polls/:pollId", async (request,reply) => {
  
  const getPollBody = z.object({
    pollId: z.string().uuid()
  });

  const {pollId}  = getPollBody.parse(request.params);
 
  const poll = await prisma.poll.findUnique({
    where: {
      id: pollId
    },
    include:{
      options:{
        select:{id:true, title: true}
      }
    }
  });

  if(!poll){
    return reply.status(400).send({message: 'Poll not found'});
  }

  const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES');
  
  const votes = result.reduce((obj, line, index) => {
    if(index % 2 === 0){
      const score = result[index + 1];
      Object.assign(obj,{[line]: Number(score)});
    }
    return obj;
  }, {} as Record<string, number>);

  return reply.send({
    poll:{
      id: poll.id,
      title: poll.title,
      options: poll.options.map(Itemoption => {
        return {
          id: Itemoption.id,
          title: Itemoption.title,
          score: (Itemoption.id in votes) ? votes[Itemoption.id] : 0,
        }
      })
    }
  });

});

}