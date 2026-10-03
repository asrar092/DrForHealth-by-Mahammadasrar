import {
  HeartPulse,
  Utensils,
  Dumbbell,
  Apple,
  Moon,
  ShieldCheck,
  Activity,
  Users,
  Stethoscope,
  CheckCircle2,
  Brain,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface">

      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <section className="py-16 md:py-24 px-6">

        <div className="max-w-6xl mx-auto text-center">

          <div className="w-20 h-20 mx-auto rounded-3xl bg-brand-gradient flex items-center justify-center shadow-lg mb-6">

            <HeartPulse
              size={40}
              className="text-white"
            />

          </div>

          <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">
            About DrForHealth
          </p>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-charcoal">

            Eat Right.

            <br />

            <span className="bg-brand-gradient bg-clip-text text-transparent">
              Live Better.
            </span>

          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-charcoal/60 mt-6 leading-relaxed">

            DrForHealth is a health and wellness platform providing
            practical eBooks, useful health information, and everyday
            wellness resources to help you make better choices,
            build healthier habits, and live better every day.

          </p>

        </div>

      </section>


      {/* =====================================================
          INTRODUCTION
      ====================================================== */}

      <section className="px-6 pb-16">

        <div className="max-w-5xl mx-auto">

          <div className="glass-card p-7 md:p-10">

            <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-5">
              Making Healthy Living Simple
            </h2>

            <div className="space-y-5 text-charcoal/70 leading-relaxed">

              <p>

                We believe healthy living should be

                <strong className="text-charcoal">
                  {' '}simple, practical, and easy to understand.
                </strong>

                {' '}Good health is built through everyday choices,
                balanced nutrition, regular activity, proper rest,
                and healthy lifestyle habits.

              </p>


              <p>

                DrForHealth provides practical health resources covering
                nutrition, fitness, weight management, sleep, wellness,
                and other important areas of everyday health.

              </p>


              <p>

                Our goal is to make useful health information easier
                to understand and easier to apply in daily life.

              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          HEALTH & WELLNESS CATEGORIES
      ====================================================== */}

      <section className="px-6 py-16 bg-white/50">

        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-10">

            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider">
              What We Cover
            </p>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mt-2">
              Health & Wellness
            </h2>

            <p className="text-charcoal/60 mt-3 max-w-2xl mx-auto">
              Explore practical health and wellness resources across
              nutrition, fitness, lifestyle, and everyday wellbeing.
            </p>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Nutrition & Diet */}

            <CategoryCard
              icon={Utensils}
              title="Nutrition & Diet"
            />


            {/* Fitness & Exercise */}

            <CategoryCard
              icon={Dumbbell}
              title="Fitness & Exercise"
            />


            {/* Weight Loss */}

            <CategoryCard
              icon={Activity}
              title="Weight Loss"
            />


            {/* Weight Gain */}

            <CategoryCard
              icon={Apple}
              title="Weight Gain"
            />


            {/* Healthy Meal Plans */}

            <CategoryCard
              icon={Utensils}
              title="Healthy Meal Plans"
            />


            {/* Mental Health */}

            <CategoryCard
              icon={Brain}
              title="Mental Health & Stress Management"
            />


            {/* Sleep & Recovery */}

            <CategoryCard
              icon={Moon}
              title="Sleep & Recovery"
            />


            {/* Heart Health */}

            <CategoryCard
              icon={HeartPulse}
              title="Heart Health"
            />


            {/* Diabetes */}

            <CategoryCard
              icon={Activity}
              title="Diabetes & Blood Sugar Management"
            />


            {/* Natural Health */}

            <CategoryCard
              icon={Apple}
              title="Natural Health & Lifestyle"
            />


            {/* Preventive Healthcare */}

            <CategoryCard
              icon={ShieldCheck}
              title="Preventive Healthcare"
            />


            {/* Family Health */}

            <CategoryCard
              icon={Users}
              title="Family Health"
            />


            {/* General Fitness */}

            <CategoryCard
              icon={Dumbbell}
              title="General Fitness & Wellness"
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          PERSONALIZED APPROACH
      ====================================================== */}

      <section className="px-6 py-16">

        <div className="max-w-6xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            {/* LEFT */}

            <div>

              <p className="text-sm font-semibold text-green-600 uppercase tracking-wider">
                Practical Approach
              </p>

              <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mt-2">
                Health Guidance That Fits Everyday Life
              </h2>

              <p className="text-charcoal/60 mt-5 leading-relaxed">

                DrForHealth focuses on practical health information
                that can be understood easily and incorporated into
                everyday routines.

              </p>


              <div className="mt-6 space-y-3">

                <FeatureItem text="Simple and practical health information" />

                <FeatureItem text="Nutrition and meal guidance" />

                <FeatureItem text="Fitness and everyday activity guidance" />

                <FeatureItem text="Healthy lifestyle resources" />

              </div>

            </div>


            {/* RIGHT */}

            <div className="glass-card p-7">

              <h3 className="font-display text-xl font-bold text-charcoal mb-5">
                Everyday Health
              </h3>

              <div className="grid grid-cols-2 gap-3">

                <FoodItem name="Balanced Meals" />

                <FoodItem name="Fresh Foods" />

                <FoodItem name="Roti & Rice" />

                <FoodItem name="Dal & Vegetables" />

                <FoodItem name="Fruits" />

                <FoodItem name="Protein Foods" />

                <FoodItem name="Regular Activity" />

                <FoodItem name="Healthy Habits" />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          LIFESTYLE GUIDANCE
      ====================================================== */}

      <section className="px-6 py-16 bg-white/50">

        <div className="max-w-5xl mx-auto text-center">

          <p className="text-sm font-semibold text-green-600 uppercase tracking-wider">
            Beyond Nutrition
          </p>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mt-2">
            Healthy Daily Habits
          </h2>

          <p className="max-w-3xl mx-auto text-charcoal/60 mt-4 leading-relaxed">

            Better health is not only about food. Everyday movement,
            proper rest, stress management, and consistent healthy
            routines also play an important role in overall wellbeing.

          </p>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">

            <HabitCard
              icon={Activity}
              title="Daily Activity"
              description="Simple activity guidance to encourage a more active lifestyle."
            />

            <HabitCard
              icon={Dumbbell}
              title="Exercise & Fitness"
              description="Practical fitness ideas that can fit into everyday routines."
            />

            <HabitCard
              icon={HeartPulse}
              title="Healthy Routines"
              description="Simple habits that support overall health and wellness."
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          OUR MISSION
      ====================================================== */}

      <section className="px-6 py-16">

        <div className="max-w-5xl mx-auto">

          <div className="glass-card p-8 md:p-12 text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-green-100 flex items-center justify-center mb-5">

              <HeartPulse
                size={28}
                className="text-green-600"
              />

            </div>


            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider">
              Our Mission
            </p>


            <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mt-2">
              Eat Right. Live Better.
            </h2>


            <p className="max-w-3xl mx-auto text-charcoal/60 mt-5 leading-relaxed">

              Our mission is to make health and wellness information
              simple, practical, and useful for everyday life.

            </p>


            <div className="mt-8 space-y-3">

              <p className="text-xl md:text-2xl font-bold text-charcoal">
                Make Better Choices.
              </p>

              <p className="text-xl md:text-2xl font-bold text-charcoal">
                Build Healthier Habits.
              </p>

              <p className="text-xl md:text-2xl font-bold bg-brand-gradient bg-clip-text text-transparent">
                Live Better Every Day.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          HEALTH DISCLAIMER
      ====================================================== */}

      <section className="px-6 pb-16">

        <div className="max-w-5xl mx-auto">

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 md:p-8">

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-orange-100 flex items-center justify-center">

                <Stethoscope
                  size={22}
                  className="text-orange-600"
                />

              </div>


              <div>

                <h2 className="font-display text-xl font-bold text-charcoal">
                  Health Disclaimer
                </h2>


                <div className="mt-3 space-y-4 text-sm text-charcoal/70 leading-relaxed">

                  <p>

                    DrForHealth provides general health, nutrition,
                    fitness, and lifestyle information for educational
                    and wellness purposes. Our content and resources
                    are not intended to diagnose, treat, cure, or prevent
                    any disease or medical condition.

                  </p>


                  <p>

                    If you have a medical condition, are pregnant,
                    have allergies, are taking medication, or have
                    specific dietary requirements, please consult a
                    qualified healthcare professional before making
                    significant changes to your diet or exercise routine.

                  </p>


                  <p className="font-semibold text-charcoal">

                    DrForHealth does not replace professional medical
                    consultation, diagnosis, or treatment.

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}


/* ============================================================
   CATEGORY CARD
============================================================ */

function CategoryCard({ icon: Icon, title }) {

  return (

    <div className="
      glass-card
      p-5
      flex
      items-center
      gap-4
      hover:-translate-y-1
      transition-transform
    ">

      <div className="
        w-11
        h-11
        flex-shrink-0
        rounded-xl
        bg-green-100
        flex
        items-center
        justify-center
      ">

        <Icon
          size={21}
          className="text-green-600"
        />

      </div>


      <p className="text-sm font-semibold text-charcoal">
        {title}
      </p>

    </div>

  );
}


/* ============================================================
   FEATURE ITEM
============================================================ */

function FeatureItem({ text }) {

  return (

    <div className="flex items-center gap-3">

      <CheckCircle2
        size={19}
        className="text-green-600 flex-shrink-0"
      />

      <span className="text-sm text-charcoal/70">
        {text}
      </span>

    </div>

  );
}


/* ============================================================
   FOOD ITEM
============================================================ */

function FoodItem({ name }) {

  return (

    <div className="
      rounded-xl
      bg-slate-50
      border
      border-slate-100
      px-4
      py-3
      text-sm
      font-medium
      text-charcoal
    ">

      {name}

    </div>

  );

}


/* ============================================================
   HABIT CARD
============================================================ */

function HabitCard({
  icon: Icon,
  title,
  description,
}) {

  return (

    <div className="glass-card p-6 text-left">

      <div className="
        w-12
        h-12
        rounded-xl
        bg-green-100
        flex
        items-center
        justify-center
        mb-4
      ">

        <Icon
          size={23}
          className="text-green-600"
        />

      </div>


      <h3 className="font-display font-bold text-lg text-charcoal">
        {title}
      </h3>


      <p className="text-sm text-charcoal/60 mt-2 leading-relaxed">
        {description}
      </p>

    </div>

  );

}