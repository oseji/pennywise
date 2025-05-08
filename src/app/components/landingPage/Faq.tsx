"use client";

import { useRef } from "react";
import { SyntheticEvent } from "react";
import Image from "next/image";
import downArrow from "../../../assets/landingPageIcons/faq arrow.svg";

const Faq = () => {
  const faqRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];
  const faqArrowRefs = useRef<(HTMLImageElement | null)[]>([]);

  const toggleFaq = (e: SyntheticEvent) => {
    e.preventDefault();

    const faqNum = Number(e.currentTarget.getAttribute("data-value"));

    faqRefs.forEach((element, id) => {
      const faq = element.current;
      const parent = faq?.parentElement;

      //   if (id + 1 === faqNum) {
      //     faq?.classList.toggle("hiddenAnswer");
      //     faq?.classList.toggle("visibleAnswer");
      //     parent?.classList.add("bg-[#D8F3DC]");
      //   } else if (id + 1 !== faqNum) {
      //     faq?.classList.add("hiddenAnswer");
      //     faq?.classList.remove("visibleAnswer");
      //     parent?.classList.remove("bg-[#D8F3DC]");
      //   }

      if (id + 1 === faqNum) {
        faq?.classList.toggle("hiddenAnswer");
        faq?.classList.toggle("visibleAnswer");

        if (faq?.classList.contains("visibleAnswer")) {
          parent?.classList.add("bg-[#D8F3DC]");
        } else {
          parent?.classList.remove("bg-[#D8F3DC]");
        }
      } else {
        faq?.classList.add("hiddenAnswer");
        faq?.classList.remove("visibleAnswer");
        parent?.classList.remove("bg-[#D8F3DC]");
      }
    });

    faqArrowRefs.current.forEach((element, index) => {
      const arrow = element;

      if (index + 1 === faqNum) {
        arrow?.classList.toggle("rotate-180");
      } else if (index + 1 !== faqNum) {
        arrow?.classList.remove("rotate-180");
      }
    });
  };
  return (
    <div className="px-28 py-20">
      <h1 className=" sectionHeading">Frequently Asked Questions</h1>

      <p className=" text-center">
        Here are some frequently asked questions from our customers and
        potential customers.
      </p>

      <div className="faqGrp">
        <div className="faq">
          <div className="faqHeading" onClick={toggleFaq} data-value={1}>
            <h1 className="font-bold">What is Pennywise?</h1>
            <Image
              src={downArrow}
              alt="down arrow"
              ref={(el) => (faqArrowRefs.current[0] = el)}
            />
          </div>

          <div className="faqAnswer hiddenAnswer" ref={faqRefs[0]}>
            Pennywise is a budgeting and saving app designed to help users
            manage their finances more effectively by creating a personalized
            budget, tracking expenses, income and setting savings goals. This
            application helps users to manage their finances more effectively
            and make informed decisions about their spending and saving habits.
          </div>
        </div>

        <div className="faq">
          <div className="faqHeading" onClick={toggleFaq} data-value={2}>
            <h1 className="font-bold">How do I register? </h1>
            <Image
              src={downArrow}
              alt="down arrow"
              ref={(el) => (faqArrowRefs.current[1] = el)}
            />
          </div>

          <div className="faqAnswer hiddenAnswer" ref={faqRefs[1]}>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit.
            Accusantium eaque officia perferendis ad, expedita adipisci quisquam
            aspernatur facere reiciendis est. Sequi nesciunt expedita nemo
            dolor, quae illum quasi amet iusto!
          </div>
        </div>

        <div className="faq">
          <div className="faqHeading" onClick={toggleFaq} data-value={3}>
            <h1 className="font-bold">
              Can Businesses use Pennywise or it is strictly for personal use?{" "}
            </h1>
            <Image
              src={downArrow}
              alt="down arrow"
              ref={(el) => (faqArrowRefs.current[2] = el)}
            />
          </div>

          <div className="faqAnswer hiddenAnswer" ref={faqRefs[2]}>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit.
            Accusantium eaque officia perferendis ad, expedita adipisci quisquam
            aspernatur facere reiciendis est. Sequi nesciunt expedita nemo
            dolor, quae illum quasi amet iusto!
          </div>
        </div>

        <div className="faq">
          <div className="faqHeading" onClick={toggleFaq} data-value={4}>
            <h1 className="font-bold">
              What is the major challenge of Pennywise?{" "}
            </h1>
            <Image
              src={downArrow}
              alt="down arrow"
              ref={(el) => (faqArrowRefs.current[3] = el)}
            />
          </div>

          <div className="faqAnswer hiddenAnswer" ref={faqRefs[3]}>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit.
            Accusantium eaque officia perferendis ad, expedita adipisci quisquam
            aspernatur facere reiciendis est. Sequi nesciunt expedita nemo
            dolor, quae illum quasi amet iusto!
          </div>
        </div>

        <div className="faq">
          <div className="faqHeading" onClick={toggleFaq} data-value={5}>
            <h1 className="font-bold">Are there any hidden charges? </h1>
            <Image
              src={downArrow}
              alt="down arrow"
              ref={(el) => (faqArrowRefs.current[4] = el)}
            />
          </div>

          <div className="faqAnswer hiddenAnswer" ref={faqRefs[4]}>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit.
            Accusantium eaque officia perferendis ad, expedita adipisci quisquam
            aspernatur facere reiciendis est. Sequi nesciunt expedita nemo
            dolor, quae illum quasi amet iusto!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
