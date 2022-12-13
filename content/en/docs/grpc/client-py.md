---
title: Python Client
linktitle: Python Client
description: Retrieve Falco events using the gRPC Python Client
weight: 60
---

The [client-py](https://github.com/falcosecurity/client-py) Python library provides:

- A `Client` class, used to initialize a gRPC secure channel with the Falco gRPC server.
- `Request` and `Response` classes representing the protobuf objects having the same name.

Refer to the [example](https://github.com/falcosecurity/client-py/blob/master/examples/get_events.py) to see how the Python client connects to the Falco gRPC Outputs API and displays the events in JSON.

Currently the Python client has two output formats: the [Response](https://github.com/falcosecurity/client-py/blob/master/falco/domain/response.py) class which is the default one and is recommended if the data needs to be processed further with Python or JSON. To enable the JSON output it is sufficient to pass the `output_format="json"` parameter when instanciating a `Client`.

1. Ensure that you have the certificates in the example's path at `/tmp/{client.crt,client.key,ca.crt}`.

2. Create and activate a Python environment with the [required dependencies](https://github.com/falcosecurity/client-py/blob/master/requirements.txt).

3. From the [client-py](https://github.com/falcosecurity/client-py) root directory, run:

    ```bash
    $ python -m examples.get_events -o json
    ```

    You should see output events starting flowing in depending on the set of rules your Falco instance has.

    ```json
    {
      "time":"2020-03-03T17:50:03.391768+00:00",
      "priority":"warning",
      "source":"syscall",
      "rule":"Delete or rename shell history",
      "output":"18:50:03.391767411: Warning Shell history had been deleted or renamed (user=matt type=unlink command=zsh fd.name=<NA> name=<NA> path=/home/matt/.zsh_history.LOCK oldpath=<NA> host (id=host))",
      "output_fields":{
          "container.name":"host",
          "user.name":"matt",
          "container.id":"host",
          "fd.name":"<NA>",
          "proc.cmdline":"zsh",
          "evt.arg.path":"/home/matt/.zsh_history.LOCK",
          "evt.arg.name":"<NA>",
          "evt.arg.oldpath":"<NA>",
          "evt.type":"unlink",
          "evt.time":"18:50:03.391767411"
      },
      "hostname":"localhost.localdomain"
    }
    ```
