import CredentialsProvider from 'next-auth/providers/credentials';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'eu-west-2' });

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials;
      
        const data = await client.send(new ScanCommand({
          TableName: 'pool-league-users',
          FilterExpression: 'email = :email',
          ExpressionAttributeValues: {
            ':email': { S: email }
          }
        }));
      
        const user = data.Items?.[0];
      
        if (user && user.password?.S === password) {
          return {
            id: user.id?.S || user.email.S,
            email: user.email.S,
            username: user.username?.S || 'Player',
            isCaptain: user.isCaptain?.BOOL || false,
            team: user.team?.S || ''
          };
        }
      
        return null;
      }
      
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.isCaptain = user.isCaptain;
        token.team = user.team;
      }
      return token;
        },
    async session({ session, token }) {
      session.user.username = token.username;
      session.user.isCaptain = token.isCaptain;
      session.user.team = token.team;
      return session;
        },
    }
};
