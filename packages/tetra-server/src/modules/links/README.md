# The `links` module

This module provides all the public functionality for dealing with shortlinks including creating them, retrieving info about them, and deleting them. Administrative functions, such as modifying links and deleting them __without__ a deletion key are instead handled in the `admin` module.

### Tasks

The `links.service` includes a reoccurring task running at a 1 minute (by default) interval that deletes all links based on their `expiresAt` value.
