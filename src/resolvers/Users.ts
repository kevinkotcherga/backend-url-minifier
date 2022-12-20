import { Resolver, Mutation, Arg, Query, Ctx } from "type-graphql";
import { User, UserInput} from "../entities/User";
import datasource from "../utils";
import{ hash, verify } from "argon2";
import { sign, verify as jwtVerify } from "jsonwebtoken";

@Resolver()
export class UsersResolver {
  @Mutation(() => User)
  async createUser(@Arg('data', () => UserInput) data: UserInput): Promise<User> {
    data.password = await hash(data.password);
    return await datasource.getRepository(User).save(data);
  }

  @Mutation(() => String, {nullable: true})
  async signin(
    @Arg('email') email: string,
    @Arg('password') password: string
    ): Promise<string | null> {
    try {
      const user = await datasource
      .getRepository(User)
      .findOne({where: {email} });

      if(!user){
        return null;
      }

      if(await verify(user.password, password)){
        const token = sign({userId: user.id}, 'supersecret!');
        return token;
      } else {
        return null;
      }
    } catch {
      return null;
    };
  }

  @Query(() => User, {nullable: true})
  async me(@Ctx() context: { token: null | string }): Promise<User | null> {
    const token = context.token;

    if(token === null){
      return null;
    }

    try {
      const decodedToken: {userId: number} = jwtVerify(token, "supersecret!") as any;
      const userId = decodedToken.userId;
      const user = await datasource.getRepository(User).findOne({where: {id: userId}});

      if(user == null) {
        return null;
      }

      return user;

    } catch {
      return null;
    }
  }

  @Query(() => [User])
  async users(): Promise<User[]> {
    return await datasource.getRepository(User).find({});
  }
}
