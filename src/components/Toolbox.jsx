import { useEditor } from '@craftjs/core';
import {
  Box,
  Typography,
  Grid2,
  Button as MaterialButton,
} from '@mui/material';
import React from 'react';

// You need to create your custom components like Text, Button, etc.
const CustomButton = (props) => (
  <MaterialButton {...props}>{props.text}</MaterialButton>
);
const CustomText = (props) => <Typography>{props.text}</Typography>;
const CustomContainer = (props) => <Box padding={props.padding} {...props} />;
const CustomCard = (props) => <Card {...props} />;

export const Toolbox = () => {
  const { connectors } = useEditor();

  return (
    <Box px={2} py={2}>
      <Grid2
        container
        direction="column"
        alignItems="center"
        justify="center"
        spacing={1}
      >
        <Box pb={2}>
          <Typography>Drag to add</Typography>
        </Box>
        <Grid2 container direction="column" item>
          <MaterialButton
            ref={(ref) =>
              connectors.create(ref, <CustomButton text="Click me" />)
            }
            variant="contained"
            data-cy="toolbox-button"
          >
            Button
          </MaterialButton>
        </Grid2>
        <Grid2 container direction="column" item>
          <MaterialButton
            ref={(ref) =>
              connectors.create(ref, <CustomText text="Hi world" />)
            }
            variant="contained"
            data-cy="toolbox-text"
          >
            Text
          </MaterialButton>
        </Grid2>
        <Grid2 container direction="column" item>
          <MaterialButton
            ref={(ref) =>
              connectors.create(ref, <CustomContainer padding={20} />)
            }
            variant="contained"
            data-cy="toolbox-container"
          >
            Container
          </MaterialButton>
        </Grid2>
        <Grid2 container direction="column" item>
          <MaterialButton
            ref={(ref) => connectors.create(ref, <CustomCard />)}
            variant="contained"
            data-cy="toolbox-card"
          >
            Card
          </MaterialButton>
        </Grid2>
      </Grid2>
    </Box>
  );
};
