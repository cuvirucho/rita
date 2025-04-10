import React from 'react';


const Reviews = () => {
  const reviews = [
    {
      id: 1,
      name: 'Carlos M.',
      review: '¡Gracias a Rita Fit, ahora disfruto de comidas saludables sin complicaciones. ¡Es perfecto para mi estilo de vida ocupado!.',
     procsiom:"Cliente Satisfecho",


    },
    {
      id: 2,
      name: 'Ana G.',
      review: 'Los planes personalizados de Rita Fit han transformado mi salud. ¡Recomiendo totalmente!',
      procsiom:"Entrenadora Personal",
    },
    {
      id: 3,
      name: 'Juan P.',
      review: 'La calidad de los ingredientes y la variedad de menús son increíbles. Rita Fit ha hecho que comer saludable sea muy fácil.',
      procsiom:"Nutricionista",
    },
  ];

  return (
    <div className="reviews-container">
      
      <div className="reviews">
        {reviews.map((review) => (
          <div className="review" key={review.id}>
            <p className="review-text">"{review.review}"</p>
            <p className="review-author">- {review.name}</p>
            <p className="review-text">"{review.procsiom}"</p>
          </div>
        ))}
      </div>
     
    </div>
  );
};

export default Reviews;
