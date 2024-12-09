/* eslint-disable react/prop-types */
import { MenuItem } from 'react-pro-sidebar';
import { Link, useLocation } from 'react-router-dom';

const Item = ({ title, path, icon }) => {
  const location = useLocation();
  return (
    <MenuItem
      component={<Link to={path} />}
      to={path}
      icon={icon}
      rootStyles={{
        color: path === location.pathname && '#82DFC6FF',
        backgroundColor: path === location.pathname && '#1e5245',
        borderRadius: '20px',
        fontSize: 15,
      }}
    >
      {title}
    </MenuItem>
  );
};

export default Item;
