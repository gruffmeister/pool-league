// lib/awsConfig.js
import { Amplify } from 'aws-amplify';


Amplify.configure({
  Auth: {
    region: 'eu-west-2',
    userPoolId: 'eu-west-2_GSjNjBgql',
    userPoolWebClientId: '2pank2tmjo4j96vi3d4gpu22rm',
  },
});
