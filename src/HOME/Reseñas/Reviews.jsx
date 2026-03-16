const reviews = [
  {
    id: 1,
    name: "Carlos M.",
    initial: "C",
    review:
      "Gracias a Rita Fit, ahora disfruto de comidas saludables sin complicaciones. Es perfecto para mi estilo de vida ocupado.",
    role: "Cliente Satisfecho",
  },
  {
    id: 2,
    name: "Ana G.",
    initial: "A",
    review:
      "Los planes personalizados de Rita Fit han transformado mi salud. ¡Recomiendo totalmente!",
    role: "Entrenadora Personal",
  },
  {
    id: 3,
    name: "Juan P.",
    initial: "J",
    review:
      "La calidad de los ingredientes y la variedad de menús son increíbles. Rita Fit ha hecho que comer saludable sea muy fácil.",
    role: "Nutricionista",
  },
];

const Reviews = () => {
  return (
    <div className="reviews-grid">
      {reviews.map((review) => (
        <div className="review-card" key={review.id}>
          <div className="review-stars">★★★★★</div>
          <p className="review-text">"{review.review}"</p>
          <div className="review-author">
            <div className="review-avatar">{review.initial}</div>
            <div className="review-author-info">
              <span className="review-author-name">{review.name}</span>
              <span className="review-author-role">{review.role}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reviews;
