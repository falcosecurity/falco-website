---
title: "Halfway Through GSoC 2024: My Progress and Plans with Falco" 
date: 2024-07-24
author: GLVS Kiriti
tags: ["Gsoc","midterm","Mentorship"]
slug: gsoc-2024-midterm
images:
  - /blog/gsoc2024/images/falco-gsoc-featured.jpg
---

Hello Falco community, I'm [Kiriti](https://github.com/GLVSKiriti), a current GSoC mentee under Falco Security. I have been working diligently to improve the testing and benchmarking capabilities of Falco’s event-generator project. Now that we've reached the midterm of GSoC, I'm eager to share the journey so far. In this blog, I'll delve into the details of my contributions, particularly focusing on two key PRs that have been merged, and outline my plans for the remainder of the program.

### My Project: Enhancing Falco's Event-Generator

The event-generator is a vital utility within the Falco ecosystem, designed to test Falco's detection capabilities. My Google Summer of Code project focuses on upgrading the event-generator to enhance its testing and benchmarking capabilities, reliability, and consistency. Additionally, I am developing new Continuous Integration (CI) pipelines based on the upgraded event-generator. The ultimate goal is to evolve the event-generator into the standard tool for systematically assessing the correctness and performance of Falco’s threat detection capabilities during every release and development cycle.

### My Journey So Far:

Before being selected for GSoC, I contributed to the event-generator repository. I am grateful to [Leonardo Grasso](https://github.com/leogr) and [Federico Di Pierro](https://github.com/FedeDP), who played a vital role in getting my PRs merged during the pre-GSoC contribution phase. These contributions helped me understand the event-generator codebase. I am also thankful to my mentors, [Jason Dellaluce](https://github.com/jasondellaluce) and [Aldo Lacuku](https://github.com/alacuku), for selecting me as a GSoC mentee. I will share my complete story of getting selected to GSoC in future.

After my selection, Jason, Aldo, and I collectively designed a plan to enhance the event-generator. The community bonding period was crucial in designing and understanding the implementation plan. You can view our idea [here](https://hackmd.io/@aldolck/r1o9yU170), which we will implement during this GSoC period.

Once the coding period began, we managed to merge two key PRs before the midterm. These PRs partially added support for testing Falco rules using declarative YAML files in the event-generator. We also added support for a container runner, which spawns a new container and runs the specified steps inside it. This is particularly useful for testing Falco rules that trigger when certain events are executed inside a container.

### Detailed Look at the Merged PRs:

- #### PR1: [Add support for declarative yaml file testing](https://github.com/falcosecurity/event-generator/pull/211)
    - what's new added in this PR?:
        - Added a new sub command for run command called declarative:
            ```yaml
            event-generator run declarative [yaml-file-path]
            ```

        - Implemented a helper function that parses the YAML file and returns the content in a specified format. The function signature is as follows:
            ```go
                func parseYamlFile(filepath string) (declarative.Tests, error) 
            ```
            Each yaml file structure should be in the following format
            ```go
                type SyscallStep struct {
                    Syscall string            `yaml:"syscall"`
                    Args    map[string]string `yaml:"args"`
                }

                type Test struct {
                    Rule   string        `yaml:"rule"`
                    Runner string        `yaml:"runner"`
                    Before string        `yaml:"before"`
                    Steps  []SyscallStep `yaml:"steps"`
                    After  string        `yaml:"after"`
                }

                type Tests struct {
                    Tests []Test `yaml:"tests"`
                }
            ```
        - Implemented a host runner
            A host runner is represented with the following interface
            ```go
                type Runner interface {
                    Setup(beforeScript string) error
                    ExecuteStep(step SyscallStep) error
                    Cleanup(afterScript string) error
                }
            ```
            The Setup method runs a shell script (`beforeScript`) before executing the specified steps using the `ExecuteStep` method. The `Cleanup` method runs a shell script (`afterScript`) after executing the steps. 

            The `ExecuteStep` method makes some syscalls specified in the YAML file using helper functions. For example, when a write syscall is used in the YAML file steps, it runs the following write syscall helper function:

        - Added helper for making a write syscall:
            The function signature is as follows
            ```go
                func WriteSyscall(filePath string, content string) error
            ```
- #### PR2: [Add container runner support](https://github.com/falcosecurity/event-generator/pull/216)
    - To implement a container runner, we needed the ability to spawn a container and execute the events inside it. We achieved this using the Docker GO SDK.

    - The container runner interface is similar to the host runner, with two new parameters: `ContainerId` and `Image`. 

    - The `Setup` method spawns a container with the given image name, saves the `ContainerId`, and also executes the `beforeScript`. The `Cleanup` method removes the container after executing the steps.
        ```go
            type Runner interface {
                ContainerId string
                Image       string
                Setup(beforeScript string) error
                ExecuteStep(step SyscallStep) error
                Cleanup(afterScript string) error
            }
        ```

### Future Work:

The upcoming tasks we are going to handle are:
- Implement `ExecuteStep` method in container runner
- Add support/ helper functions to make various syscalls
- Improve benchmarking capabilities of the event-generator
- Integrate the event-generator in falco ci pipeline

### Conclusion:

Participating in GSoC with Falco Security has been an incredible journey so far. Enhancing the event-generator has provided me with invaluable insights into cloud-native runtime security and the complexities of Falco’s detection capabilities. The support and guidance from my mentors, Jason and Aldo, through our weekly 1:1 calls, have been crucial in overcoming challenges and driving the project forward.

As I look ahead, I am excited about the upcoming tasks and the potential impact our improvements will have on the Falco ecosystem. I eagerly anticipate continuing this journey and sharing more updates on our progress. Thank you for following along!
