import { Resolver, Mutation, Arg, Query } from "type-graphql";
import { User} from "../entities/User";
import datasource from "../utils";
import{ hash } from "argon2";

@Resolver()
export class UsersResolver {
  @Mutation(() => User)
  async createUser(@Arg('email') email: string, @Arg('password') password: string): Promise<User> {
    const hashedPassword = await hash(password);
    return await datasource.getRepository(User).save({ email, password: hashedPassword });
  }

  @Query(() => [User])
  async users(): Promise<User[]> {
    return await datasource.getRepository(User).find({});
  }
}

// 32min50 stop vidéo
