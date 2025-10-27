-- Add more venue icons with both filled and outline versions
INSERT INTO venue_icons (name, description, svg_path, category, is_filled, display_order) VALUES
-- Location Markers (outline)
('Church', 'Religious venue', 'M12 2L4 7v9h16V7l-8-5zm0 2.5L18 8v6H6V8l6-3.5zM12 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4z', 'location', false, 10),
('Temple', 'Hindu temple', 'M12 2l-2 2H8v2H6v2H4v10h7v-6h2v6h7V8h-2V6h-2V4h-2L12 2zm0 3l1 1h1v1h1v1h1v8h-3v-6H9v6H6V8h1V7h1V6h1L12 5z', 'location', false, 11),
('Mosque', 'Islamic mosque', 'M12 2c-1 0-2 1-2 2h4c0-1-1-2-2-2zm0 3c-2 0-4 1-4 3v2H6v10h12V10h-2V8c0-2-2-3-4-3zm-2 5h4v8h-4v-8z', 'location', false, 12),
('Beach', 'Beach venue', 'M17 6c-1.7 0-3 1.3-3 3v1H7c-1.1 0-2 .9-2 2v6h14v-6c0-1.1-.9-2-2-2h-3V9c0-.6.4-1 1-1s1 .4 1 1v1h2V9c0-1.7-1.3-3-3-3zm-5 6h4v4h-4v-4z', 'location', false, 13),
('Mountain', 'Mountain venue', 'M14 6l-4 5-2-2-4 7h16l-6-10zm0 3l3.5 5.5h-7L14 9z', 'location', false, 14),
('Garden', 'Garden venue', 'M12 2C9.79 2 8 3.79 8 6c0 1.48.81 2.75 2 3.45V11H8v2h2v2H8v2h2v3h4v-3h2v-2h-2v-2h2v-2h-2V9.45c1.19-.7 2-1.97 2-3.45 0-2.21-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z', 'location', false, 15),
('Vineyard', 'Vineyard venue', 'M12 2C8.5 4 6 6.5 6 10v10h12V10c0-3.5-2.5-6-6-8zm4 16h-2v-4c0-1.1-.9-2-2-2s-2 .9-2 2v4H8v-8c0-2.5 1.5-4.5 4-6 2.5 1.5 4 3.5 4 6v8z', 'location', false, 16),
('Castle', 'Castle venue', 'M3 3v6h2V7h2v2h2V3H7v2H5V3H3zm10 0v6h2V7h2v2h2V3h-2v2h-2V3h-2zM4 11v10h4v-4h8v4h4V11H4zm2 2h12v6h-2v-4H8v4H6v-6z', 'location', false, 17),
('Barn', 'Barn venue', 'M12 3L4 7v13h16V7l-8-4zm0 2.5L18 8v10H6V8l6-2.5zM10 12v6h4v-6h-4z', 'location', false, 18),
('Rooftop', 'Rooftop venue', 'M4 19h16v2H4v-2zm0-4h16v2H4v-2zM6 9h12v4H6V9zm-2 8h16v-2H4v2zM12 3l-8 4v2h16V7l-8-4zm0 2l5 2.5H7L12 5z', 'location', false, 19),

-- Location Markers (filled)
('Church', 'Religious venue', 'M12 2L4 7v9h16V7l-8-5zM12 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4z', 'location', true, 20),
('Temple', 'Hindu temple', 'M12 2l-2 2H8v2H6v2H4v10h7v-6h2v6h7V8h-2V6h-2V4h-2L12 2z', 'location', true, 21),
('Mosque', 'Islamic mosque', 'M12 2c-1 0-2 1-2 2h4c0-1-1-2-2-2zm0 3c-2 0-4 1-4 3v2H6v10h12V10h-2V8c0-2-2-3-4-3z', 'location', true, 22),
('Beach', 'Beach venue', 'M17 6c-1.7 0-3 1.3-3 3v1H7c-1.1 0-2 .9-2 2v6h14v-6c0-1.1-.9-2-2-2h-3V9c0-.6.4-1 1-1s1 .4 1 1v1h2V9c0-1.7-1.3-3-3-3z', 'location', true, 23),
('Mountain', 'Mountain venue', 'M14 6l-4 5-2-2-4 7h16l-6-10z', 'location', true, 24),
('Garden', 'Garden venue', 'M12 2C9.79 2 8 3.79 8 6c0 1.48.81 2.75 2 3.45V11H8v2h2v2H8v2h2v3h4v-3h2v-2h-2v-2h2v-2h-2V9.45c1.19-.7 2-1.97 2-3.45 0-2.21-1.79-4-4-4z', 'location', true, 25),
('Vineyard', 'Vineyard venue', 'M12 2C8.5 4 6 6.5 6 10v10h12V10c0-3.5-2.5-6-6-8z', 'location', true, 26),
('Castle', 'Castle venue', 'M3 3v6h2V7h2v2h2V3H7v2H5V3H3zm10 0v6h2V7h2v2h2V3h-2v2h-2V3h-2zM4 11v10h4v-4h8v4h4V11H4z', 'location', true, 27),
('Barn', 'Barn venue', 'M12 3L4 7v13h16V7l-8-4zM10 12v6h4v-6h-4z', 'location', true, 28),
('Rooftop', 'Rooftop venue', 'M4 19h16v2H4v-2zm0-4h16v2H4v-2zM6 9h12v4H6V9zM12 3l-8 4v2h16V7l-8-4z', 'location', true, 29),

-- Buildings (outline)
('Hotel', 'Hotel building', 'M7 13v8h10v-8l-5-4-5 4zm8 6h-2v-2h2v2zm-4 0h-2v-2h2v2zm4-4h-2v-2h2v2zm-4 0h-2v-2h2v2zM5 3v18h14V3H5zm2 2h10v14H7V5z', 'building', false, 30),
('Restaurant', 'Restaurant venue', 'M8 3v10h2V3H8zm0 12v6h2v-6H8zm6-12h-2v6h2v6h2v-6h2V3h-2v4h-2V3zm0 12v6h2v-6h-2z', 'building', false, 31),
('Cafe', 'Cafe venue', 'M2 19h20v2H2v-2zm2-6h16v4H4v-4zm0-2V9c0-2.8 2.2-5 5-5h6c2.8 0 5 2.2 5 5v2H4zm2-2h12V9c0-1.7-1.3-3-3-3H9c-1.7 0-3 1.3-3 3v2z', 'building', false, 32),

-- Buildings (filled)
('Hotel', 'Hotel building', 'M7 13v8h10v-8l-5-4-5 4zm8 6h-2v-2h2v2zm-4 0h-2v-2h2v2zm4-4h-2v-2h2v2zm-4 0h-2v-2h2v2zM5 3v18h14V3H5z', 'building', true, 33),
('Restaurant', 'Restaurant venue', 'M8 3v10h2V3H8zm0 12v6h2v-6H8zm6-12h-2v6h2v6h2v-6h2V3h-2v4h-2V3zm0 12v6h2v-6h-2z', 'building', true, 34),
('Cafe', 'Cafe venue', 'M2 19h20v2H2v-2zm2-6h16v4H4v-4zm0-2V9c0-2.8 2.2-5 5-5h6c2.8 0 5 2.2 5 5v2H4z', 'building', true, 35),

-- Decorative (outline and filled)
('Heart', 'Heart icon', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', 'decorative', false, 40),
('Heart', 'Heart icon', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', 'decorative', true, 41),
('Star', 'Star icon', 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', 'decorative', false, 42),
('Star', 'Star icon', 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', 'decorative', true, 43),
('Flower', 'Flower icon', 'M12 2c-1.1 0-2 .9-2 2 0 .74.4 1.38 1 1.72V7H9.28C8.94 6.4 8.3 6 7.56 6c-1.1 0-2 .9-2 2s.9 2 2 2c.74 0 1.38-.4 1.72-1H11v1.28c-.6.34-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V10h1.28c.34.6.98 1 1.72 1 1.1 0 2-.9 2-2s-.9-2-2-2c-.74 0-1.38.4-1.72 1H13V5.72c.6-.34 1-.98 1-1.72 0-1.1-.9-2-2-2zm0 16c-1.66 0-3 1.34-3 3h6c0-1.66-1.34-3-3-3z', 'decorative', false, 44),
('Flower', 'Flower icon', 'M12 2c-1.1 0-2 .9-2 2 0 .74.4 1.38 1 1.72V7H9.28C8.94 6.4 8.3 6 7.56 6c-1.1 0-2 .9-2 2s.9 2 2 2c.74 0 1.38-.4 1.72-1H11v1.28c-.6.34-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V10h1.28c.34.6.98 1 1.72 1 1.1 0 2-.9 2-2s-.9-2-2-2c-.74 0-1.38.4-1.72 1H13V5.72c.6-.34 1-.98 1-1.72 0-1.1-.9-2-2-2zm0 16c-1.66 0-3 1.34-3 3h6c0-1.66-1.34-3-3-3z', 'decorative', true, 45);