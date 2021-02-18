import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  return (
    <h1>{currentUser ? 'Welcome User!' : 'Hey Guest, Please Sign IN!'}</h1>
  );
};

LandingPage.getInitialProps = async (context) => {
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');

  return data;
};

export default LandingPage;
