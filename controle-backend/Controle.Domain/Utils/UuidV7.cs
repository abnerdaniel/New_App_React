using System;
using System.Security.Cryptography;

namespace Controle.Domain.Utils;

public static class UuidV7
{
    public static Guid NewUuid()
    {
        // UUID v7 format:
        // 0                   1                   2                   3
        // 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
        // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        // |                           unix_ts_ms                          |
        // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        // |          unix_ts_ms           |  ver  |       rand_a          |
        // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        // |var|                        rand_b                             |
        // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        // |                            rand_b                             |
        // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

        var unixTsMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var bytes = new byte[16];

        // Fill with random bytes first
        RandomNumberGenerator.Fill(bytes);

        // Set timestamp (48 bits)
        bytes[0] = (byte)((unixTsMs >> 40) & 0xFF);
        bytes[1] = (byte)((unixTsMs >> 32) & 0xFF);
        bytes[2] = (byte)((unixTsMs >> 24) & 0xFF);
        bytes[3] = (byte)((unixTsMs >> 16) & 0xFF);
        bytes[4] = (byte)((unixTsMs >> 8) & 0xFF);
        bytes[5] = (byte)(unixTsMs & 0xFF);

        // Set version (4 bits) to 7
        bytes[6] = (byte)((bytes[6] & 0x0F) | 0x70);

        // Set variant (2 bits) to 10 (RFC 4122)
        bytes[8] = (byte)((bytes[8] & 0x3F) | 0x80);

        return new Guid(bytes);
    }
}
