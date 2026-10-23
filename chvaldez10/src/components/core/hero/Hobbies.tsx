import ImageCard from "@/components/ui/ImageCard";

const hobbies = [
  {
    title: "MMA",
    imageSrc: "/images/octagon.jpg",
    imageAlt: "An MMA octagon inside an arena",
    cardDescription:
      "The technique, strategy, and energy of mixed martial arts.",
  },
  {
    title: "K-pop",
    imageSrc: "/images/kpop-image.jpg",
    imageAlt: "A K-pop display in a city street",
    cardDescription: "The music, performances, and creativity of K-pop.",
  },
];

export default function Hobbies() {
  return (
    <section
      id="hobbies"
      aria-labelledby="hobbies-heading"
      className="min-h-screen flex-items-center scroll-mt-20 bg-white py-24 sm:py-32"
    >
      <div className="home-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="hobbies-heading"
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            What I enjoy outside of work
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-700">
            MMA and K-pop are two interests I keep coming back to.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {hobbies.map((hobby) => (
            <ImageCard
              key={hobby.title}
              title={hobby.title}
              description={hobby.cardDescription}
              imageSrc={hobby.imageSrc}
              imageAlt={hobby.imageAlt}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
