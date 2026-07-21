const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const oldGalleryImage = `<Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />`;

const newGalleryImage = `<img
                  src={item.src}
                  alt={item.alt}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />`;

const oldAllanImage = `<Image
        src="/allan-duque.png"
        alt="Allan Duque — Fundador da Barbearia Mr. Duque"
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover object-top"
        priority
      />`;

const newAllanImage = `<img
        src="/allan-duque.png"
        alt="Allan Duque — Fundador da Barbearia Mr. Duque"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />`;

code = code.replace(oldGalleryImage, newGalleryImage);
code = code.replace(oldAllanImage, newAllanImage);
fs.writeFileSync('app/page.tsx', code);
