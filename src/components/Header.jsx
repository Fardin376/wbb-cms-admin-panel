/* eslint-disable react/prop-types */
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";

const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box display={"flex"} flexDirection={"column"} justifyContent={"center"} alignItems={"center"}>
      <Typography
        variant="h2"
        fontWeight="bold"
        color={colors.gray[300]}
        mb="5px"
      >
        {title}
      </Typography>
      <Typography variant="h4" color={colors.greenAccent[300]}>
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;
