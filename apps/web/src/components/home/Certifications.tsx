import Image from "next/image";

const certifications = [
  { name: "ANCC Accredited Provider", src: "/images/awards/ancc.png" },
  { name: "CARF Accredited", src: "/images/awards/carf.png" },
  { name: "CHAP Standards of Excellence", src: "/images/awards/chap.png" },
  { name: "Home Care Pulse Certified", src: "/images/awards/hcp.png" },
  { name: "Hospice Honors Elite", src: "/images/awards/hospice-honors.png" },
];

export function Certifications() {
  return (
    <section className="border-t border-gray-200 bg-white py-12 sm:py-16">
      <div className="max-w-[1512px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-center gap-4 sm:gap-6 overflow-x-auto">
          {certifications.map(({ name, src }) => (
            <div
              key={name}
              className="flex items-center justify-center flex-shrink-0 bg-white"
              style={{ width: 260, height: 160 }}
            >
              <Image
                src={src}
                alt={name}
                width={260}
                height={160}
                className="object-contain p-1 sm:p-2 w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
