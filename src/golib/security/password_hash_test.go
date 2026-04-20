package security

import (
	"testing"
)

type testCase struct {
	pwd    string
	salt   string
	result string
}

func TestMatchesDenoImplementation(t *testing.T) {
	testCases := []testCase{
		{
			pwd:    "password123",
			salt:   "random_salt_1",
			result: "snX3W4fOGr0PDrm/cbV4Kc15M2UOABwWpoi+JrbrbsS6eI/6N3wBr1gzbW0bs4hhPHIFR6NFrD/5fErrH9wFdA==",
		},
		{
			pwd:    "my_secure_pass",
			salt:   "salty_stuff_2",
			result: "uaBorZzEQYXriPZR/Wo6OulXrEkDziC48S3uugHisMtBhRKP1EvUA2SBqkesBClyaDypnxmxFFh+zf5C5cJ1qQ==",
		},
		{
			pwd:    "admin_account",
			salt:   "unique_id_99",
			result: "Zht41uAxIqpPlG9OXg01Rl3AB1evy/cKdoGEtAk3U2kg5YVG5R9PocIG1QtYnZT0YEuU/FBmuc/i1yck38rl5g==",
		},
		{
			pwd:    "guest_user",
			salt:   "guest_salt_4",
			result: "YDjbr26ZjuWnfqLfq0hlS70xNEg0CQBMEzZ7tc+rBMrQuiNlVsFCkz2/2A2iCvMp23rbhQl7xFc0r4J7KIItsw==",
		},
		{
			pwd:    "qwertyuiop",
			salt:   "keyboard_cat",
			result: "Ik6whXz0fYhsB3AKne+rftRkfUnen2ga+IQlM1edKZJTJmJXCwvDf9jLOLxXVHS8xqZqkZQaspeFlhWLX+CDAA==",
		},
		{
			pwd:    "LetMeIn2024!",
			salt:   "security_layer",
			result: "rBfgO7G1dQTxc0+GoP8VtGhbpQ0u0vYDg/2u2q2+2Vo+RJ8071qyrnZ03GCwb2BMJVFp2r9YaRE5qZAib9SeTQ==",
		},
		{
			pwd:    "complex_p@ssw0rd",
			salt:   "entropy_source",
			result: "fKlG/7q5MiXuEiACAyCQpg17mCBkx9ybhXbQZgokJc6Ih8a3O48wtEImTY9phxPSj9C0egTl7+Y3wheWLB3iuw==",
		},
		{
			pwd:    "shadow_walker",
			salt:   "dark_place",
			result: "Ix/ndMavdVYfeQ9J4d1+SweH9nOmJnxO1TH1R/tYLd+akW5F/kkkpStaYUasmsKXwL7p4UsyDwXqvQCdau/75g==",
		},
		{
			pwd:    "coffee_lover",
			salt:   "caffeine_hit",
			result: "NTJmKyynRobbjSQ6X/ONV6A8wyZ16RlNKzx0TugrSlmymytWnyNui4o9CFMoWuelrOrK+Oym5cedPeWRyhkrjg==",
		},
		{
			pwd:    "final_test_case",
			salt:   "last_salt_bit",
			result: "o9X8oAUIrVjHauiWMZAuRpT51sFu6O5LRxh/85oDcqqei1427oOteS6BKFVdTirOJJru747dmK6sEUkdcSScAQ==",
		},
	}

	for _, tc := range testCases {
		hash, err := Pbkdf2Hash(tc.pwd, tc.salt)
		if err != nil {
			t.Error("Error when running pbkdf2", err)
		}
		if hash != tc.result {
			t.Error("test vectors for hashes do not match")
		}
	}
}
