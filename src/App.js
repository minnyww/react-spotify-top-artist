import {
  Button,
  Card,
  Col,
  Container,
  Grid,
  Loading,
  Text,
  User,
} from "@nextui-org/react";
import axios from "axios";
import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./App.css";
const scopes = [
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "streaming",
  "user-read-private",
  "user-library-read",
  "user-top-read",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-follow-read",
].join(",");

const authEndpoint = "https://accounts.spotify.com/authorize";
const redirectUri = "http://localhost:3000/callback";
const clientId = "64f3f525894245e09b0053cbdb15bf36";
const loginUrl = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=token&show_dialog=true`;

const USER_COLOR = ["primary", "secondary", "success", "warning", "error"];

const ArtistCard = memo(({ name, genre, coverUrl, imageHeight = 370 }) => {
  return (
    <Card css={{ mw: "400px" }}>
      <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
        <Col>
          <Text
            css={{
              textGradient: "45deg, $blue600 -20%, $pink600 50%",
            }}
            size={14}
            weight="bold"
            transform="uppercase"
            color="#ffffffAA"
          >
            {name}
          </Text>
          <Text h4 color="white" transform="uppercase">
            {genre}
          </Text>
        </Col>
      </Card.Header>
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Card.Image
          src={coverUrl}
          objectFit="cover"
          width="100%"
          height={imageHeight}
          alt="Card image background"
          css={{ filter: "opacity(0.8)" }}
        />
      </motion.div>
    </Card>
  );
});

const getTokenFromUrl = () => {
  return window.location.hash
    .substring(1)
    .split("&")
    .reduce((initial, item) => {
      let parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
      return initial;
    }, {});
};

function App() {
  const [token, setToken] = useState();
  const [topArtist, setTopArtist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const spotifyToken = getTokenFromUrl();
    if (spotifyToken) {
      setToken(spotifyToken.access_token);
    }
  }, []);

  useEffect(() => {
    if (token) {
      const headers = {
        Authorization: "Bearer " + token,
      };
      try {
        setIsLoading(true);

        // axios
        //   .get("https://api.spotify.com/v1/me/top/tracks", { headers })
        //   .then((response) => {
        //     // console.log(response.data);
        //   });

        axios
          .get("https://api.spotify.com/v1/me/top/artists", { headers })
          .then((response) => {
            const unorganizedGenres = response.data.items.map((artist) => {
              const genreArr = artist.genres;
              return genreArr;
            });
            setTopArtist(response.data.items);
            const allGenres = unorganizedGenres.flat();
            const removeDulplicateGenres = allGenres.reduce((all, current) => {
              all[current] = (all[current] || 0) + 1;

              return all;
            }, {});
            const formatGenreToArray = Object.entries(removeDulplicateGenres)
              .map(([key, value]) => {
                return {
                  genre: key,
                  count: value,
                };
              })
              .sort((a, b) => b.count - a.count);
            console.log("formatGenreToArray : ", formatGenreToArray);
            setIsLoading(false);
          });
      } catch (error) {
      } finally {
      }
    }
  }, [token]);
  const fistTopArtist = topArtist?.[0];
  const secondArtist = topArtist?.[1];
  const thirdArtist = topArtist?.[2];

  const otherArtist = [...topArtist]?.splice(3, topArtist.length);
  return (
    <Container>
      <Text
        h1
        size={60}
        css={{
          textGradient: "45deg, $blue600 -20%, $pink600 50%",
          textAlign: "center",
        }}
        weight="bold"
      >
        Get Your Top Artist
      </Text>
      {isLoading ? (
        <Grid.Container
          justify="center"
          css={{ marginBottom: "2rem", marginTop: "2rem" }}
        >
          <Grid justify="center">
            <Loading type="points" />
          </Grid>
        </Grid.Container>
      ) : (
        <Grid.Container gap={2} justify="center">
          <Grid sm={4} xs={12} justify="center">
            <ArtistCard
              name={secondArtist?.name}
              coverUrl={secondArtist?.images?.[0]?.url}
              genre={secondArtist?.genres?.map((item) => item).join(", ")}
            />
          </Grid>
          <Grid sm={4} xs={12} justify="center">
            {!token ? (
              <Button
                bordered
                color="gradient"
                auto
                onClick={() => window.open(loginUrl)}
              >
                Login Spotify
              </Button>
            ) : (
              <ArtistCard
                name={fistTopArtist?.name}
                coverUrl={fistTopArtist?.images?.[0]?.url}
                genre={fistTopArtist?.genres?.map((item) => item).join(", ")}
              />
            )}
          </Grid>
          <Grid sm={4} xs={12} justify="center">
            <ArtistCard
              name={thirdArtist?.name}
              coverUrl={thirdArtist?.images?.[0]?.url}
              genre={thirdArtist?.genres?.map((item) => item).join(", ")}
            />
          </Grid>
        </Grid.Container>
      )}
      {isLoading ? (
        <Grid.Container
          justify="center"
          css={{ marginBottom: "2rem", marginTop: "2rem" }}
        >
          <Grid justify="center">
            <Loading type="points" />
          </Grid>
        </Grid.Container>
      ) : (
        <Grid.Container gap={2}>
          {otherArtist?.map((artist) => {
            const randomColor = Math.floor(Math.random() * USER_COLOR.length);
            return (
              <Grid css={{ cursor: "grab" }} key={artist.id}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                >
                  <User
                    bordered
                    src={artist?.images?.[2]?.url || artist?.images?.[0]?.url}
                    name={artist?.name}
                    color={USER_COLOR[randomColor]}
                  />
                </motion.div>
              </Grid>
            );
          })}
        </Grid.Container>
      )}
    </Container>
  );
}

export default App;
