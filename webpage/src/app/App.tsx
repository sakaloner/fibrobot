import image_01a9a34f8accfb423c7fd1a4ee1e601d10261acf from "../assets/01a9a34f8accfb423c7fd1a4ee1e601d10261acf.png";
import image_1335a2b9af5d4e226ad4f7c0231b7e0fa861440f from "../assets/1335a2b9af5d4e226ad4f7c0231b7e0fa861440f.png";
import pipeMeditating from "../assets/pipe_meditating_new.jpeg";
// import promoVideo from "../assets/promo_video.mov";
import { useState } from "react";
import {
  HeartPulse,
  Calendar,
  Users,
  Video,
  Music,
  Dumbbell,
  MessageCircle,
  Check,
  ChevronDown,
  ArrowRight,
  Flower2,
  Sparkles,
  Brain,
  Utensils,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Label } from "./components/ui/label";

export default function App() {
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    diagnosisTime: "",
  });

  const [openMethodId, setOpenMethodId] = useState<
    number | null
  >(null);
  const [openFaqId, setOpenFaqId] = useState<number | null>(
    null,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({
      name: "",
      whatsapp: "",
      email: "",
      diagnosisTime: "",
    });
    alert(
      "¡Gracias! Nos pondremos en contacto contigo pronto.",
    );
  };

  const painPoints = [
    "Sientes que tu cuerpo te traicionó y el dolor nunca descansa.",
    "Vives agotada, aunque duermas. El cansancio es tu única compañía constante.",
    "Te dijeron que 'aprendas a vivir con esto', pero sabes que mereces más.",
  ];

  const included = [
    {
      icon: Calendar,
      title: "2 Consultas Médicas",
      description: "Personalizadas con Dr. Juan Diego",
    },
    {
      icon: Video,
      title: "8 Clases en Vivo",
      description: "Meditación, movimiento y conocimiento",
    },
    {
      icon: Music,
      title: "Meditación Diaria Guiada",
      description: "Audio exclusivo para tu sanación",
    },
    {
      icon: Dumbbell,
      title: "Ejercicio Adaptado",
      description: "Suave, sanador y efectivo",
    },
    {
      icon: Users,
      title: "Grupo de WhatsApp",
      description: "Acompañamiento y comunidad diaria",
    },
    {
      icon: HeartPulse,
      title: "Plan Nutricional",
      description: "Alimentación antiinflamatoria",
    },
  ];

  const methods = [
    {
      id: 1,
      icon: Brain,
      title: "Meditación MBSR",
      description:
        "Mindfulness Based Stress Reduction: técnica clínicamente validada para reducir el dolor crónico y la ansiedad.",
    },
    {
      id: 2,
      icon: Dumbbell,
      title: "Ejercicio Sanador",
      description:
        "Movimiento adaptado que fortalece sin agredir. Yoga suave, estiramientos conscientes y técnicas de liberación miofascial.",
    },
    {
      id: 3,
      icon: Flower2,
      title: "Medicina Integrativa",
      description:
        "Acupuntura, fitoterapia y abordaje médico holístico. Tratamos la raíz, no solo los síntomas.",
    },
    {
      id: 4,
      icon: Utensils,
      title: "Nutrición Antiinflamatoria",
      description:
        "Alimentos que sanan desde adentro. Aprende qué comer para reducir la inflamación y recuperar tu energía.",
    },
  ];

  const benefits = [
    "Reduce el dolor crónico sin depender solo de medicamentos",
    "Recupera tu energía y calidad de sueño",
    "Aprende herramientas para gestionar el estrés y la ansiedad",
    "Encuentra una comunidad de mujeres que te entienden",
    "Reconecta con tu cuerpo desde el amor, no desde la lucha",
    "Recupera la esperanza de que sí es posible sentirte mejor",
  ];

  const faqs = [
    {
      id: 1,
      question: "¿Dónde están ubicados?",
      answer:
        "Estamos basados en Pereira, Colombia — pero el programa es 100% online, así que puedes participar desde cualquier lugar del mundo.",
    },
    {
      id: 2,
      question: "¿El programa es presencial u online?",
      answer:
        "Es completamente online. Todas las consultas, clases y sesiones de meditación se realizan de forma virtual, desde la comodidad de tu casa.",
    },
    {
      id: 3,
      question: "¿Cuándo son las clases en vivo?",
      answer:
        "Las clases serán probablemente los martes y jueves a las 7:00 PM (hora Colombia). El horario definitivo se acordará con los participantes del grupo.",
    },
    {
      id: 4,
      question:
        "¿Qué pasa si no puedo asistir a una clase en vivo?",
      answer:
        "No te preocupes — todas las clases quedan grabadas y disponibles para que las veas cuando puedas, sin perder ningún contenido.",
    },
    {
      id: 5,
      question: "¿Para quién es este programa?",
      answer:
        "Para mujeres con diagnóstico de fibromialgia que están cansadas de respuestas vacías y quieren un acompañamiento real que trate su condición desde la raíz.",
    },
    {
      id: 6,
      question: "¿Cuántos cupos hay?",
      answer:
        "Solo 20 — porque el acompañamiento es personalizado y queremos garantizar atención real para cada participante.",
    },
    {
      id: 7,
      question: "¿Cómo me inscribo?",
      answer:
        "Reserva tu cupo directamente desde la página web o escríbenos por WhatsApp y el Dr. Velásquez se pondrá en contacto contigo personalmente.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 26, 26, 0.3), rgba(139, 26, 26, 0.4)), url('https://images.unsplash.com/photo-1760611674352-4781fd17ac32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMG1lZGl0YXRpb24lMjBuYXR1cmUlMjBwZWFjZWZ1bHxlbnwxfHx8fDE3NzE1NDI2NTR8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <div className="inline-block mb-6">
            <Flower2
              className="w-16 h-16 text-[#C9A84C] mx-auto mb-4"
              strokeWidth={1.5}
            />
          </div>

          <h1
            className="text-5xl md:text-7xl mb-6 tracking-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            La fibromialgia no es una sentencia.
          </h1>

          <p
            className="text-xl md:text-2xl mb-12 text-white/90 max-w-2xl mx-auto"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Un programa de 30 días que te acompaña a sanar tu
            cuerpo y tu mente desde la medicina integrativa, la
            meditación y el movimiento consciente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-[#8B1A1A] hover:bg-[#6B1515] text-[#C9A84C] shadow-[0_0_20px_rgba(201,168,76,0.3)] px-8 py-6 text-lg rounded-[14px] transition-all hover:shadow-[0_0_30px_rgba(201,168,76,0.5)]"
              onClick={() =>
                window.open(
                  "https://wa.me/message/66YARXTJNAIGP1",
                  "_blank",
                )
              }
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Hablar con el Dr. Velásquez
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#8B1A1A] px-8 py-6 text-lg rounded-[14px] transition-all"
              onClick={() =>
                document
                  .getElementById("lead-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Quiero más información
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 px-6 bg-[#FAF7F2]">
        <div className="max-w-[720px] mx-auto">
          {/* Label */}
          <p
            className="text-center text-[#C9A84C] uppercase mb-8 text-sm tracking-[2px]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Conoce nuestro método
          </p>

          {/* Video Placeholder or Link */}
          <div className="max-w-4xl mx-auto mb-16 px-6">
            <div className="aspect-[9/16] max-w-[350px] mx-auto bg-black rounded-[24px] flex items-center justify-center border-2 border-[#C9A84C]/20 shadow-2xl overflow-hidden">
              <iframe
                src="https://player.vimeo.com/video/1166832936?h=sv&badge=0&autopause=0&player_id=0&app_id=58479"
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                title="Programa Renace - Video Promocional"
              ></iframe>
            </div>
          </div>

          {/* Description Text */}
          <p
            className="text-center text-gray-600 max-w-[480px] mx-auto text-lg leading-relaxed px-6"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Te explicamos cómo este programa
            puede transformar tu relación con el dolor.
          </p>

          {/* Gold Divider */}
          <div className="w-32 h-[2px] bg-[#C9A84C] mx-auto mt-16" />
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {painPoints.map((point, index) => (
              <div
                key={index}
                className="bg-white/50 backdrop-blur-sm p-8 rounded-[16px] border border-[#C9A84C]/20 shadow-sm"
              >
                <p
                  className="text-xl text-[#8B1A1A]/80 italic"
                  style={{
                    fontFamily: "Playfair Display, serif",
                  }}
                >
                  "{point}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Renace */}
      <section className="py-20 px-6 bg-white/30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-24 h-[2px] bg-[#C9A84C] mx-auto mb-8" />

          <h2
            className="text-4xl md:text-5xl mb-8 text-[#8B1A1A]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            ¿Qué es Renace?
          </h2>

          <p
            className="text-lg leading-relaxed text-gray-700 mb-6"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Renace es un programa intensivo de 30 días diseñado
            específicamente para mujeres con fibromialgia que
            están listas para recuperar el control de su salud y
            su vida.
          </p>

          <p
            className="text-lg leading-relaxed text-gray-700"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            No es una píldora mágica. Es un camino probado que
            combina medicina integrativa, meditación MBSR,
            movimiento sanador y acompañamiento constante.
            Porque mereces más que solo "aprender a vivir con
            esto".
          </p>

          <div className="w-24 h-[2px] bg-[#C9A84C] mx-auto mt-8" />
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl md:text-5xl mb-16 text-center text-[#8B1A1A]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Qué incluye el programa
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {included.map((item, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-[16px] shadow-sm hover:shadow-[0_0_25px_rgba(201,168,76,0.15)] transition-all border border-[#C9A84C]/10"
              >
                <item.icon
                  className="w-12 h-12 text-[#C9A84C] mb-4"
                  strokeWidth={1.5}
                />
                <h3
                  className="text-2xl mb-2 text-[#8B1A1A]"
                  style={{
                    fontFamily: "Playfair Display, serif",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-gray-600"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-20 px-6 bg-white/30">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-4xl md:text-5xl mb-16 text-center text-[#8B1A1A]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Conoce a tu equipo
          </h2>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#C9A84C] shadow-lg">
                <img
                  src={
                    image_01a9a34f8accfb423c7fd1a4ee1e601d10261acf
                  }
                  alt="Dr. Juan Diego Velásquez"
                  className="w-full h-full object-cover ml-[0px] mr-[4px] mt-[0px] mb-[34px] rounded-[21px]"
                />
              </div>
              <h3
                className="text-2xl mb-2"
                style={{
                  fontFamily: "Playfair Display, serif",
                }}
              >
                <span className="text-[#C9A84C]">
                  Dr. Juan Diego Velásquez
                </span>
              </h3>
              <p
                className="text-sm text-gray-600 mb-4 uppercase tracking-wider"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Medicina Integrativa & Acupuntura
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Médico especializado en medicina integrativa y
                acupuntura enfocado en pacientes con dolor
                crónico, trastornos mentales y fibromialgia.
              </p>
            </div>

            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#C9A84C] shadow-lg">
                <img
                  src={pipeMeditating}
                  alt="Andrés 'Pipe' Velásquez"
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: "center",
                    transform: "scale(1.1)",
                  }}
                />
              </div>
              <h3
                className="text-2xl mb-2"
                style={{
                  fontFamily: "Playfair Display, serif",
                }}
              >
                <span className="text-[#C9A84C]">
                  Andrés "Pipe" Velásquez
                </span>
              </h3>
              <p
                className="text-sm text-gray-600 mb-4 uppercase tracking-wider"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Profesor de Meditación
              </p>
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Instructor certificado en meditación MBSR y
                mindfulness, especializado en dolor crónico y
                manejo del estrés emocional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methods Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-4xl md:text-5xl mb-16 text-center text-[#8B1A1A]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Nuestras metodologías
          </h2>

          <div className="space-y-4">
            {methods.map((method) => (
              <div
                key={method.id}
                className="bg-white rounded-[16px] border border-[#C9A84C]/20 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <button
                  onClick={() =>
                    setOpenMethodId(
                      openMethodId === method.id
                        ? null
                        : method.id,
                    )
                  }
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-[#FAF7F2] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <method.icon
                      className="w-10 h-10 text-[#C9A84C]"
                      strokeWidth={1.5}
                    />
                    <h3
                      className="text-2xl text-[#8B1A1A]"
                      style={{
                        fontFamily: "Playfair Display, serif",
                      }}
                    >
                      {method.title}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 text-[#8B1A1A] transition-transform ${openMethodId === method.id ? "rotate-180" : ""}`}
                  />
                </button>

                {openMethodId === method.id && (
                  <div className="px-6 pb-6 pt-2">
                    <p
                      className="text-gray-700 leading-relaxed pl-14"
                      style={{
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {method.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-[#8B1A1A]">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-4xl md:text-5xl mb-16 text-center text-[#C9A84C]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Resultados que puedes esperar
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-white/5 backdrop-blur-sm p-6 rounded-[14px] border border-[#C9A84C]/30"
              >
                <Check
                  className="w-6 h-6 text-[#C9A84C] flex-shrink-0 mt-1"
                  strokeWidth={2.5}
                />
                <p
                  className="text-white text-lg"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Book */}
      <section className="py-20 px-6 bg-white/30">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-[16px] p-8 md:p-12 shadow-lg border-4 border-[#C9A84C]/30">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Sparkles className="w-10 h-10 text-[#C9A84C] mb-4" />
                <h3
                  className="text-3xl mb-4 text-[#8B1A1A]"
                  style={{
                    fontFamily: "Playfair Display, serif",
                  }}
                >
                  Respaldado por conocimiento y experiencia
                </h3>
                <p
                  className="text-gray-700 leading-relaxed mb-4"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  El Dr. Juan Diego Velásquez es autor del libro{" "}
                  <strong>
                    "Fibromialgia: un camino integral"
                  </strong>
                  , una guía sobre el abordaje holístico de esta
                  condición.
                </p>
                <p
                  className="text-gray-700 leading-relaxed"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Este programa es la versión intensiva y
                  práctica de años de investigación y
                  experiencia clínica ayudando a pacientes a
                  recuperar su calidad de vida.
                </p>
              </div>

              <div className="flex justify-center">
                <a
                  href="https://dr-juan-diego-velasquez.tiendup.com/p/fibromialgia-guia-integrativa-para-recuperar-tu-salud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-64 h-80 rounded-[12px] overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform cursor-pointer"
                >
                  <img
                    src={
                      image_1335a2b9af5d4e226ad4f7c0231b7e0fa861440f
                    }
                    alt="Libro Fibromialgia: un camino integral"
                    className="w-full h-full object-cover ml-[-3px] mr-[0px] mt-[-1px] mb-[0px]"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Section */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-4xl md:text-5xl mb-8 text-[#8B1A1A]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Inversión en tu sanación
          </h2>

          <div className="bg-white rounded-[16px] p-10 shadow-lg border-2 border-[#C9A84C]/30 mb-8">
            <p className="text-gray-500 line-through text-2xl mb-4">
              $900.000 COP
            </p>

            <div className="mb-4">
              <span
                className="text-6xl font-bold text-[#8B1A1A]"
                style={{
                  fontFamily: "Playfair Display, serif",
                }}
              >
                $297.000
              </span>
              <span className="text-2xl text-gray-600 ml-2">
                COP
              </span>
            </div>

            {/* Currency Pouch */}
            <div className="inline-flex flex-wrap justify-center gap-4 mb-8 bg-[#FAF7F2] px-6 py-4 rounded-[12px] border border-[#C9A84C]/20 shadow-sm text-gray-600">
              <span className="text-sm font-medium">~$77 USD</span>
              <span className="text-[#C9A84C]/40 hidden md:inline">•</span>
              <span className="text-sm font-medium">~$72.000 CLP</span>
              <span className="text-[#C9A84C]/40 hidden md:inline">•</span>
              <span className="text-sm font-medium">~$1.300 MXN</span>
            </div>

            <p className="text-[10px] text-gray-400 mb-5 italic uppercase tracking-wider">
              * El precio exacto varía según la tasa de cambio del día
            </p>

            <div className="space-y-5 mb-6">
              <p
                className="text-lg font-medium text-[#8B1A1A] tracking-wide"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Precio especial primera cohorte
              </p>

              <div className="flex justify-center">
                <span className="inline-block bg-[#C9A84C] text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest shadow-sm">
                  Cupos limitados
                </span>
              </div>

              <p
                className="text-lg text-gray-600"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Empezamos el <strong>2 de marzo de 2026</strong>
              </p>
            </div>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-[1px] w-12 bg-[#C9A84C]/30" />
              <div className="w-2 h-2 rounded-full border border-[#C9A84C]/50" />
              <div className="h-[1px] w-12 bg-[#C9A84C]/30" />
            </div>

            {/* Payment Section */}
            <div className="mt-1">
              <h3
                className="text-2xl mb-6 text-[#8B1A1A]"
                style={{
                  fontFamily: "Playfair Display, serif",
                }}
              >
                Completa tu inscripción
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="bg-[#8B1A1A] hover:bg-[#7a1b1b] text-white shadow-xl h-[90px] text-lg rounded-[16px] transition-all hover:scale-[1.02]"
                  onClick={() =>
                    window.open(
                      "https://checkout.wompi.co/l/ivYlLC",
                      "_blank",
                    )
                  }
                >
                  <span className="flex flex-col items-center">
                    <span className="text-xs opacity-70 mb-1">
                      ESTOY EN COLOMBIA
                    </span>
                    <span className="font-bold text-[#facb47]">
                      Pagar en Colombia
                    </span>
                  </span>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#8B1A1A] text-[#8B1A1A] hover:bg-[#FAF7F2] h-[90px] text-lg rounded-[16px] transition-all shadow-sm hover:shadow-md hover:scale-[1.02]"
                  onClick={() =>
                    window.open(
                      "https://www.paypal.com/ncp/payment/RRC4HDVYGQ5QG",
                      "_blank",
                    )
                  }
                >
                  <span className="flex flex-col items-center">
                    <span className="text-xs opacity-70 mb-1">
                      ESTOY EN CHILE / MÉXICO
                    </span>
                    <span className="font-bold">
                      Pagar con PayPal
                    </span>
                  </span>
                </Button>
              </div>

              <p
                className="text-xs text-gray-500 mt-4"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Pago seguro. Después de completar tu pago
                recibirás confirmación por email.
              </p>
            </div>
          </div>

          <p
            className="text-gray-600 italic"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Tu salud no tiene precio. Esta es tu oportunidad de
            invertir en ti.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="lead-form"
        className="py-20 px-6 bg-[#FAF7F2]"
      >
        <div className="max-w-2xl mx-auto">
          {/* Gold divider line */}
          <div className="w-32 h-[2px] bg-[#C9A84C] mx-auto mb-16" />

          <div className="text-center">
            <h2
              className="text-4xl md:text-5xl mb-6 text-[#8B1A1A]"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              ¿Tienes alguna duda?
            </h2>

            <p
              className="text-lg md:text-xl text-gray-600 mb-10 mx-auto max-w-[480px] leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Escríbenos por WhatsApp y agendamos una llamada de
              10 minutos para contarte todo personalmente.
            </p>

            <Button
              size="lg"
              className="bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg px-10 py-6 text-lg rounded-[12px] transition-all hover:scale-105 active:scale-95 w-full sm:w-auto border-none"
              onClick={() =>
                window.open(
                  "https://wa.me/message/66YARXTJNAIGP1",
                  "_blank",
                )
              }
            >
              <MessageCircle className="mr-3 h-6 w-6 fill-white text-white" />
              <span className="font-bold tracking-tight">Contactar por WhatsApp</span>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-white/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Flower2
              className="w-12 h-12 text-[#C9A84C] mx-auto mb-6"
              strokeWidth={1.5}
            />
            <h2
              className="text-4xl md:text-5xl text-[#8B1A1A]"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={`bg-white rounded-[16px] border border-[#C9A84C]/20 overflow-hidden shadow-sm hover:shadow-md transition-all ${index % 2 === 0
                  ? "bg-white"
                  : "bg-[#FAF7F2]/50"
                  }`}
              >
                <button
                  onClick={() =>
                    setOpenFaqId(
                      openFaqId === faq.id ? null : faq.id,
                    )
                  }
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-[#FAF7F2] transition-colors group"
                >
                  <h3
                    className="text-xl md:text-2xl text-[#8B1A1A] pr-4"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openFaqId === faq.id ? (
                      <Minus
                        className="w-6 h-6 text-[#C9A84C] transition-all"
                        strokeWidth={2}
                      />
                    ) : (
                      <Plus
                        className="w-6 h-6 text-[#C9A84C] transition-all"
                        strokeWidth={2}
                      />
                    )}
                  </div>
                </button>

                {openFaqId === faq.id && (
                  <div className="px-6 pb-6 pt-2 border-t border-[#C9A84C]/10">
                    <p
                      className="text-gray-700 text-lg leading-relaxed"
                      style={{
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#8B1A1A] text-white/80">
        <div className="max-w-6xl mx-auto text-center">
          <Flower2
            className="w-10 h-10 text-[#C9A84C] mx-auto mb-4"
            strokeWidth={1.5}
          />
          <p
            className="text-xl mb-2 text-[#C9A84C]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Dr. Juan Diego Velásquez
          </p>
          <p
            className="text-sm"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Medicina Integrativa · Programa Renace
          </p>
          <p className="text-xs mt-4 text-white/60">
            © 2026 Programa Renace. Tu salud, tu renacimiento.
          </p>
        </div>
      </footer>
    </div>
  );
}