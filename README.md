# Kombinator

**Kombinator** is a set of build plugins that combines a Nuxt 3 base project and a customization layer into a fully functional product. It is designed to streamline the process of creating customized versions of a Nuxt 3 application.

To use the tool, developers first create or obtain the Nuxt 3 base project, which serves as the foundation for all customized versions. They then create a customization layer that includes any necessary modifications or additions to the base project. This might include changes to the user interface, business logic, or integration with other systems.

Once the base project and customization layer are created, the tool combines them into a single, fully functional product. This can be done through a process of merging the two codebases, compiling the resulting code, and generating any necessary configuration files or deployment scripts.

The resulting product is then ready for testing and deployment, either on a local machine or in a production environment. The customization layer can be easily swapped out or modified as needed, allowing for rapid iteration and customization of the underlying Nuxt 3 application.

## Known limitations

There are a few challenges that were not able to solve now. Feel free to contribute!
- This file watches changes only on existing .mod.ts files, if you add .mod.ts file you need to restart your dev/watch process. 

## History associated with the name

The Polish word *kombinator* refers to a person who is crafty, resourceful, and skilled at finding solutions to problems through creative thinking, often using unconventional or cunning methods. It can have a slightly negative connotation and may be used to describe someone who is overly scheming or manipulative.

During the Polish People's Republic (PRL) era, which lasted from 1947 to 1989, the country was under communist rule and faced many economic and social challenges. The government controlled most aspects of daily life, including education, media, and the economy.

Under such a system, being a *kombinator* was often necessary for survival. People had to find creative ways to obtain scarce goods and services, navigate the complex bureaucracy, and make ends meet. Many faced shortages of basic necessities, such as food, housing, and clothing, and had to resort to various strategies to acquire them.

Additionally, the government often interfered in people's personal lives, limiting their freedoms and restricting their ability to pursue their goals. Being a *kombinator* allowed individuals to find ways to circumvent these restrictions and pursue their interests and ambitions.

Therefore, being a *kombinator* was often necessary during the PRL times to navigate the challenging economic and social conditions and to find ways to improve one's quality of life.

### Why this plugin duplicates some features of other plugins

This plugin has some *minor functions* that can be achieved also by plugins like rollup-plugin-copy, but:
- that plugin seems to be not maintained - many merge requests are not merged for months.
- We need only a small subset of functionalities, and we do not want to pull a huge pile of dependencies.
- At some point if those alternative plugins will be better maintained we will kick out this functionality from here.

The main purpose of this plugin is to deliver convenient API for automated modification/pathing of the base project, not copying files around.

### Chapeau bas to AI
*Parts of this plugin its documentation and tests are written with the support of Chat GPT3.5*