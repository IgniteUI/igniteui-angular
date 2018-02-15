module.exports = {
    plugins: [
        require('autoprefixer')({
            browsers: ["last 5 versions", "> 3%"],
            cascade: false,
            grid: true
        }),
    ],
};