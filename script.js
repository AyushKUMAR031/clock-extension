window.onload = function () {
    const hourHand = document.querySelector('.hour');
    const minuteHand = document.querySelector('.minute');
    const secondHand = document.querySelector('.second');
    const animeImg = document.getElementById('anime-image');


    function updateClock() {
        const now = new Date();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const hourDeg = (hours * 30) + (minutes * 0.5);
        const minuteDeg = (minutes * 6) + (seconds * 0.1);
        const secondDeg = seconds * 6;

        hourHand.style.transform = `rotate(${hourDeg}deg)`;
        minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
        secondHand.style.transform = `rotate(${secondDeg}deg)`;
    }

    function setRandomAnimeImage() {
        const images = [
            'images/allofusaredead.jpg',
            'images/bellaCiao.jpg',
            'images/lastOfUs.png',
            'images/harryPotter.png',
            'images/cyberpunk.jpg',
            'images/worldWarZ.jpg',
            'images/kakashi.png',
            'images/itachi.png',
            'images/anime9.jpg',
            'images/kaijuNo8.webp',
            'images/yourName.jpg',
            'images/squidGame.webp',
            'images/professor.png',
        ];
        const randomIndex = Math.floor(Math.random() * images.length);
        const selectedImage = images[randomIndex]; // This is the image that will be used for the clock background

        const clock = document.querySelector('.clock');
        clock.style.backgroundImage = `url(${selectedImage})`; // Set the background image of the clock
        clock.style.backgroundSize = 'cover';
        clock.style.backgroundPosition = 'center';
    }

    setInterval(updateClock, 1000);
    updateClock();
    setRandomAnimeImage();
};
