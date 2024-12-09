import React, { useEffect, useState, createContext, useContext } from 'react';
import { Box, Select, MenuItem, Typography } from '@mui/material';
import axios from 'axios';
import CategoryListBlock from './ListBlock';

export const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
});

const BlockPanel = ({ editor }) => {
  const { language, setLanguage } = useContext(LanguageContext);
  const [categories, setCategories] = useState([]);

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     const response = await axios.get(
  //       'http://localhost:5000/api/categories/categories'
  //     );
  //     setCategories(response.data.categories);
  //   };
  //   fetchCategories();
  // }, []);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="subtitle2">Select template language: </Typography>
      {/* Language Selector */}
      <Select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        size="small"
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="bn">Bangla</MenuItem>
      </Select>

      {/* Render Block Components
      {categories &&
        categories.map((category) => (
          <CategoryListBlock
            editor={editor}
            category={category}
            language={language}
          />
        ))} */}
    </Box>
  );
};

export default BlockPanel;
