import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryTree = ({ onSelect }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('/api/categories/')
      .then(response => setCategories(response.data))
      .catch(error => console.error('Error fetching categories:', error));
  }, []);

  const renderCategory = (category, level = 0) => {
    return (
      <div key={category.id} style={{ marginLeft: level * 20 }}>
        <div
          onClick={() => onSelect(category)}
          style={{ cursor: 'pointer', padding: '5px' }}
        >
          {category.name}
        </div>
        {category.subcategories.map(subId => {
          const subCategory = categories.find(cat => cat.id === subId);
          return subCategory ? renderCategory(subCategory, level + 1) : null;
        })}
      </div>
    );
  };

  return (
    <div>
      {categories
        .filter(category => !category.parent)
        .map(category => renderCategory(category))}
    </div>
  );
};

export default CategoryTree;