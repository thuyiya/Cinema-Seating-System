import { QueryInterface } from 'sequelize';
export const up = async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('Movies', [
        {
            id: '5e9b8d8f-7d6c-4b5e-927d-3a3b5e927d3a',
            title: 'Inception',
            description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
            duration: 148,
            rating: 8.8,
            posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
            genres: ['Sci-Fi', 'Action'],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: '6f9c8e7d-6b4c-3a2e-827c-2b2d6e827c2b',
            title: 'The Shawshank Redemption',
            description: 'Two imprisoned men bond over a number of years.',
            duration: 142,
            rating: 9.3,
            posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
            genres: ['Drama'],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: '7a8b9c0d-5e4f-1a2b-938d-0c1d7e938d0c',
            title: 'Dune: Part Two',
            description: 'Follow the mythic journey of Paul Atreides.',
            duration: 166,
            rating: 8.5,
            posterUrl: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
            genres: ['Sci-Fi', 'Adventure'],
            isActive: false, // Upcoming movie
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ]);

    await queryInterface.bulkInsert('Screenings', [
        {
            id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
            movieId: '5e9b8d8f-7d6c-4b5e-927d-3a3b5e927d3a', // Inception
            screenNumber: 1,
            startsAt: new Date(Date.now() + 86400000), // Tomorrow
            endsAt: new Date(Date.now() + 86400000 + 148 * 60000), // + duration
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
            movieId: '6f9c8e7d-6b4c-3a2e-827c-2b2d6e827c2b', // Shawshank
            screenNumber: 2,
            startsAt: new Date(Date.now() + 172800000), // Day after tomorrow
            endsAt: new Date(Date.now() + 172800000 + 142 * 60000),
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ]);
}

export const down = async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('Screenings', {});
    await queryInterface.bulkDelete('Movies', {});
};